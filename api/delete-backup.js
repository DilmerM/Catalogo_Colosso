import { createClient } from '@supabase/supabase-js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
    const { backup_id, file_url } = req.body;
    
    if (!backup_id) {
      return res.status(400).json({ error: 'Missing backup_id' });
    }

    // 1. Delete the physical JSON file from R2 if url is provided
    if (file_url) {
      try {
        const urlObj = new URL(file_url);
        const key = decodeURIComponent(urlObj.pathname.substring(1));
        const bucketName = process.env.R2_BUCKET_NAME || process.env.VITE_R2_BUCKET_NAME || 'catalogo';

        const deleteCmd = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key
        });
        await S3.send(deleteCmd);
      } catch (err) {
        console.error('Failed to delete file from R2, but continuing to delete record:', err.message);
      }
    }

    // 2. Delete the record from Supabase
    const { error: deleteError } = await supabase
      .from('backups')
      .delete()
      .eq('id', backup_id);

    if (deleteError) throw deleteError;

    res.status(200).json({ success: true, message: 'Backup eliminado' });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: error.message || 'Failed to delete backup' });
  }
}
