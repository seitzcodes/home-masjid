import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';
import path from 'path';

loadEnvConfig(path.resolve(__dirname, '..'));

async function run() {
  const sql = postgres({
    host: 'aws-1-ap-northeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    username: 'postgres.mwxcokklqsrxjlcrendq',
    password: 'fyP%kjwbQK9K5p&',
    ssl: 'require'
  });
  try {
    await sql`ALTER TABLE home_masjid.masjids ADD COLUMN timezone text;`;
    console.log('Column added!');
  } catch (e) {
    console.error('Error adding column:', e);
  } finally {
    await sql.end();
  }
}
run();
