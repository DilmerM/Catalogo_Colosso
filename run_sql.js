import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const connectionString = 'postgres://postgres.gpthyvxzclapcnhmccsi:87dSIxIMAeXsydr3@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    const sql = fs.readFileSync(path.join(__dirname, 'supabase_schema.sql'), 'utf8');
    
    console.log('Executing schema script...');
    await client.query(sql);
    
    console.log('Schema created successfully!');
  } catch (error) {
    console.error('Error executing SQL:', error);
  } finally {
    await client.end();
  }
}

run();
