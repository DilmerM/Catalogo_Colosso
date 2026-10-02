import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const R2_ACCOUNT_ID = 'd8b53209d688de9651a84beaf255719a';

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const corsRules = {
  CORSRules: [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["PUT", "POST", "GET", "HEAD", "OPTIONS"],
      AllowedOrigins: ["*"],
      ExposeHeaders: [],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function setCors() {
  try {
    const command = new PutBucketCorsCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'catalogo',
      CORSConfiguration: corsRules,
    });
    await S3.send(command);
    console.log("CORS set successfully on R2 bucket!");
  } catch (err) {
    console.error("Error setting CORS:", err);
  }
}

setCors();
