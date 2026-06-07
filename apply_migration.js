const fs = require('fs');
const { Client } = require('pg');

async function run() {
  const connectionString = process.env.SUPABASE_SESSION_POOLER || 'postgresql://postgres.mwxcokklqsrxjlcrendq:fyP%kjwbQK9K5p&@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    const sql = fs.readFileSync('supabase/migrations/20260607000009_privacy_and_social.sql', 'utf8');
    await client.query(sql);
    console.log("Migration applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
