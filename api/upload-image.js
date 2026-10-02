import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const R2_ACCOUNT_ID = 'd8b53209d688de9651a84beaf255719a';

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { filename, imageBase64 } = req.body;

    if (!filename || !imageBase64) {
      return res.status(400).json({ error: 'Missing filename or imageBase64' });
    }

    // 1. Decode base64 to buffer
    const rawBuffer = Buffer.from(imageBase64, 'base64');

    // 2. Convert to WebP using sharp
    const webpBuffer = await sharp(rawBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    // 3. Generate safe filename with .webp extension
    const baseName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.\-_]/g, '');
    const safeFilename = `${Date.now()}-${baseName}.webp`;

    // 4. Upload to R2
    const bucketName = process.env.R2_BUCKET_NAME || process.env.VITE_R2_BUCKET_NAME || 'catalogo';

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: safeFilename,
      Body: webpBuffer,
      ContentType: 'image/webp',
    });

    await S3.send(command);

    // 5. Return public URL
    const publicUrlBase = process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL || 'https://pub-842b0c40b47f4c18bb2b3fe641e27eb6.r2.dev';
    const publicUrl = `${publicUrlBase}/${safeFilename}`;

    res.status(200).json({
      publicUrl,
      originalSize: rawBuffer.length,
      webpSize: webpBuffer.length,
      savings: `${Math.round((1 - webpBuffer.length / rawBuffer.length) * 100)}%`
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
}
