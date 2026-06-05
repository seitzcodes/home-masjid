import postgres from 'postgres';

const sql = postgres({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mwxcokklqsrxjlcrendq',
  password: 'fyP%kjwbQK9K5p&'
});

async function run() {
  const count = await sql`SELECT COUNT(*) FROM home_masjid.masjids`;
  console.log('Row count:', count);
  const rows = await sql`SELECT * FROM home_masjid.masjids LIMIT 1`;
  console.log('First row:', rows);
  process.exit(0);
}

run();
