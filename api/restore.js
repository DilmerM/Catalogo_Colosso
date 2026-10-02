import { createClient } from '@supabase/supabase-js';
import { S3Client, CopyObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const R2_ACCOUNT_ID = 'd8b53209d688de9651a84beaf255719a';
const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { backup_id } = req.body;
    if (!backup_id) {
      return res.status(400).json({ error: 'Missing backup_id' });
    }

    // 1. Get backup URL
    const { data: backupRecord, error: backupError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backup_id)
      .single();

    if (backupError || !backupRecord) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    // 2. Fetch JSON from R2 securely via S3 API
    const urlObj = new URL(backupRecord.file_url);
    const key = decodeURIComponent(urlObj.pathname.substring(1));
    const bucketName = process.env.R2_BUCKET_NAME || process.env.VITE_R2_BUCKET_NAME || 'catalogo';

    let backupJson;
    try {
      const getCmd = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      
      const s3Response = await S3.send(getCmd);
      const backupJsonString = await s3Response.Body.transformToString();
      backupJson = JSON.parse(backupJsonString);
    } catch (s3Err) {
      throw new Error("Fallo al descargar el archivo de R2: " + s3Err.message);
    }

    const { ropa, suplementos, maquinas } = backupJson.data;

    // 3. Clear tables (Not using ID trick, use not.is.null)
    await Promise.all([
      supabase.from('ropa').delete().not('id', 'is', null),
      supabase.from('suplementos').delete().not('id', 'is', null),
      supabase.from('maquinas').delete().not('id', 'is', null)
    ]);

    // 4. Insert data
    const insertPromises = [];
    if (ropa && ropa.length > 0) insertPromises.push(supabase.from('ropa').insert(ropa));
    if (suplementos && suplementos.length > 0) insertPromises.push(supabase.from('suplementos').insert(suplementos));
    if (maquinas && maquinas.length > 0) insertPromises.push(supabase.from('maquinas').insert(maquinas));

    const results = await Promise.all(insertPromises);
    
    for (const result of results) {
      if (result.error) throw result.error;
    }

    // 5. Restore images from trash/
    const allItems = [...(ropa || []), ...(suplementos || []), ...(maquinas || [])];
    const allUrls = allItems.flatMap(item => item.image_urls || []);
    
    const bucketName = process.env.R2_BUCKET_NAME || process.env.VITE_R2_BUCKET_NAME || 'catalogo';
    
    const copyPromises = allUrls.filter(Boolean).map(url => {
      try {
        const urlObj = new URL(url);
        const key = decodeURIComponent(urlObj.pathname.substring(1));
        
        const copyCmd = new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: `${bucketName}/trash/${key}`,
          Key: key
        });
        
        return S3.send(copyCmd);
      } catch (err) {
        return Promise.resolve(); // Ignore invalid URLs
      }
    });

    // Run all copies in parallel to avoid Vercel 10s timeout
    // We add a 5-second timeout to guarantee Vercel doesn't throw 500 HTML error
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));
    await Promise.race([
      Promise.allSettled(copyPromises),
      timeoutPromise
    ]);

    res.status(200).json({ success: true, message: 'Database restored successfully' });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: error.message || 'Failed to restore backup' });
  }
}
