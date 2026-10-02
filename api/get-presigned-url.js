import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = 'd8b53209d688de9651a84beaf255719a';

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Missing filename or contentType' });
    }

    // Clean up filename and add timestamp to avoid collisions
    const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'catalogo',
      Key: safeFilename,
      ContentType: contentType,
    });

    const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
    
    // Construct the public URL that the image will be accessible at
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${safeFilename}`;

    res.status(200).json({ uploadUrl: url, publicUrl });
  } catch (error) {
    console.error('Error generating presigned URL', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
}
