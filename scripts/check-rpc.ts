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
    const users = await sql`SELECT id, full_name FROM home_masjid.user_profiles`;
    console.log('User profiles:', users);
    
    const auths = await sql`SELECT id, email FROM auth.users`;
    console.log('Auth users:', auths);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sql.end();
  }
}
run();
