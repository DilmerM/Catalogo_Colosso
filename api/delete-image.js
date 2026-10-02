import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
    const { imageUrls } = req.body;
    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ error: 'Missing or invalid imageUrls array' });
    }

    const bucketName = process.env.R2_BUCKET_NAME || process.env.VITE_R2_BUCKET_NAME || 'catalogo';
    
    // Delete each image
    for (const url of imageUrls) {
      if (!url) continue;
      
      // Extract the object key (filename) from the URL
      // E.g., https://pub-xxx.r2.dev/1790920134827-reloj5.png -> 1790920134827-reloj5.png
      try {
        const urlObj = new URL(url);
        const key = urlObj.pathname.substring(1); // Remove leading slash
        
        if (key) {
          const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: decodeURIComponent(key),
          });
          await S3.send(command);
        }
      } catch (parseErr) {
        console.error(`Invalid URL to delete: ${url}`);
      }
    }

    res.status(200).json({ success: true, message: 'Images deleted successfully' });
  } catch (error) {
    console.error('Error deleting image from R2:', error);
    res.status(500).json({ error: error.message || 'Failed to delete image' });
  }
}
