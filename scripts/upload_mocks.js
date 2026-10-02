import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import fs from 'fs';
import path from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import WebSocket from 'ws';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
    realtime: { transport: WebSocket }
  }
);

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://d8b53209d688de9651a84beaf255719a.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY,
  },
});

const uploadImage = async (filePath, filename) => {
  const rawBuffer = fs.readFileSync(filePath);
  
  // Convert to WebP
  const webpBuffer = await sharp(rawBuffer).webp({ quality: 80 }).toBuffer();
  const safeFilename = `${Date.now()}-${filename}.webp`;
  
  const bucketName = process.env.VITE_R2_BUCKET_NAME || 'catalogo';
  
  await S3.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: safeFilename,
    Body: webpBuffer,
    ContentType: 'image/webp',
  }));
  
  const publicUrlBase = process.env.VITE_R2_PUBLIC_URL || 'https://pub-842b0c40b47f4c18bb2b3fe641e27eb6.r2.dev';
  return `${publicUrlBase}/${safeFilename}`;
};

async function main() {
  const artifactsDir = '/home/dilmer/.gemini/antigravity/brain/60e6d27e-8b66-4e0e-8772-c16add2e2a01';
  
  const items = [
    {
      name: 'Whey Protein Isolate',
      description: 'Proteína aislada de suero de leche sabor chocolate. 100% pura y de rápida absorción.',
      price: 1200.00,
      stock: 50,
      is_active: true,
      imageFile: `${artifactsDir}/whey_protein_mock_1790925191798.jpg`,
      slug: 'whey-protein'
    },
    {
      name: 'Pre-Workout Voltage Max',
      description: 'Potente pre-entreno sabor frutas tropicales para energía explosiva y máxima concentración.',
      price: 850.00,
      stock: 30,
      is_active: true,
      imageFile: `${artifactsDir}/preworkout_mock_1790925201813.jpg`,
      slug: 'pre-workout'
    },
    {
      name: 'Creatine Monohydrate',
      description: 'Creatina monohidratada pura. Mejora la fuerza, potencia y ganancia muscular.',
      price: 600.00,
      stock: 100,
      is_active: true,
      imageFile: `${artifactsDir}/creatine_mock_1790925211202.jpg`,
      slug: 'creatine'
    },
    {
      name: 'BCAA Amino Acids',
      description: 'Aminoácidos ramificados ratio 2:1:1 sabor blue raspberry. Ideal para recuperación muscular.',
      price: 550.00,
      stock: 45,
      is_active: true,
      imageFile: `${artifactsDir}/bcaa_mock_1790925221206.jpg`,
      slug: 'bcaa'
    }
  ];

  for (const item of items) {
    console.log(`Uploading image for ${item.name}...`);
    const imageUrl = await uploadImage(item.imageFile, item.slug);
    
    console.log(`Inserting ${item.name} into database...`);
    const { error } = await supabase.from('suplementos').insert([{
      name: item.name,
      description: item.description,
      price: item.price,
      is_active: item.is_active,
      slug: item.slug,
      image_urls: [imageUrl]
    }]);
    
    if (error) {
      console.error(`Error inserting ${item.name}:`, error);
    } else {
      console.log(`Successfully added ${item.name}`);
    }
  }
}

main().catch(console.error);
