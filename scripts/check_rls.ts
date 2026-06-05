import postgres from 'postgres';

const sql = postgres({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mwxcokklqsrxjlcrendq',
  password: 'fyP%kjwbQK9K5p&'
});

async function run() {
  const result = await sql`SELECT relrowsecurity FROM pg_class WHERE relname = 'masjids'`;
  console.log('RLS Enabled:', result[0]?.relrowsecurity);
  process.exit(0);
}

run();
