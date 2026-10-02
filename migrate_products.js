import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { products } from './src/data/products.js';

dotenv.config({ path: '.env.local' });

// 1. Setup R2 S3 Client
const R2_ACCOUNT_ID = 'd8b53209d688de9651a84beaf255719a';
const bucketName = process.env.R2_BUCKET_NAME || process.env.VITE_R2_BUCKET_NAME || 'catalogo';
const publicUrlBase = process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL;

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

// 2. Setup Supabase Client
import ws from 'ws';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function uploadImageToR2(localPath) {
  const fullPath = path.join(process.cwd(), 'public', localPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const fileName = path.basename(localPath);
  const safeFilename = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
  let contentType = 'application/octet-stream';
  if (fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg')) contentType = 'image/jpeg';
  if (fullPath.endsWith('.png')) contentType = 'image/png';
  if (fullPath.endsWith('.webp')) contentType = 'image/webp';

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: safeFilename,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await S3.send(command);
  return `${publicUrlBase}/${safeFilename}`;
}

async function runMigration() {
  console.log('Logging in to Supabase...');
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'melany@gmail.com',
    password: 'Melany@10/$'
  });

  if (authError) {
    console.error('Failed to log in to Supabase:', authError.message);
    return;
  }
  console.log('Logged in successfully!');

  for (const product of products) {
    console.log(`Migrating product: ${product.name}`);
    const imageUrls = [];

    // Upload all images
    for (const imagePath of product.images) {
      console.log(`  Uploading image: ${imagePath}`);
      const uploadedUrl = await uploadImageToR2(imagePath);
      if (uploadedUrl) {
        imageUrls.push(uploadedUrl);
      }
    }

    // Determine gender based on sub
    let gender = 'Unisex';
    if (product.sub.toLowerCase().includes('mujer')) gender = 'Mujer';
    if (product.sub.toLowerCase().includes('hombre')) gender = 'Hombre';

    // Parse price
    const priceRaw = product.price.replace('$', '').replace(' MXN', '').replace(',', '');
    const price = parseFloat(priceRaw);

    // Prepare payload for 'ropa' table
    const payload = {
      name: product.name,
      slug: product.name.toLowerCase().replace(/ /g, '-'),
      brand: product.brand,
      description: product.description,
      price: price,
      image_urls: imageUrls,
      gender: gender,
      sizes: product.sizes,
      colors: [],
      material: ''
    };

    const { error: insertError } = await supabase.from('ropa').insert([payload]);
    if (insertError) {
      console.error(`  Error inserting ${product.name}:`, insertError.message);
    } else {
      console.log(`  Success inserting ${product.name}!`);
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

runMigration();
