import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
    // 1. Fetch all data
    const [ropaRes, suplementosRes, maquinasRes] = await Promise.all([
      supabase.from('ropa').select('*'),
      supabase.from('suplementos').select('*'),
      supabase.from('maquinas').select('*')
    ]);

    if (ropaRes.error) throw ropaRes.error;
    if (suplementosRes.error) throw suplementosRes.error;
    if (maquinasRes.error) throw maquinasRes.error;

    const backupData = {
      timestamp: new Date().toISOString(),
      data: {
        ropa: ropaRes.data,
        suplementos: suplementosRes.data,
        maquinas: maquinasRes.data
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    
    // 2. Upload to R2
    const bucketName = process.env.R2_BUCKET_NAME || process.env.VITE_R2_BUCKET_NAME || 'catalogo';
    const fileName = `backups/db-backup-${Date.now()}.json`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: 'application/json',
    });
    
    await S3.send(command);
    
    const fileUrl = `https://pub-8b77cc4dff8a4dbb83d1cce92f976dc4.r2.dev/${fileName}`;
    
    // 3. Save record in Supabase
    const { data: insertData, error: insertError } = await supabase
      .from('backups')
      .insert([
        { 
          file_url: fileUrl, 
          size_bytes: buffer.length, 
          description: req.body?.description || `Backup Automático ${new Date().toLocaleDateString()}` 
        }
      ])
      .select();

    if (insertError) throw insertError;

    res.status(200).json({ success: true, backup: insertData[0] });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: error.message || 'Failed to create backup' });
  }
}
