import postgres from 'postgres';

const sql = postgres({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mwxcokklqsrxjlcrendq',
  password: 'fyP%kjwbQK9K5p&'
});

async function run() {
  try {
    await sql`ALTER TABLE home_masjid.masjid_claims ADD COLUMN IF NOT EXISTS role_title TEXT NOT NULL DEFAULT 'Admin', ADD COLUMN IF NOT EXISTS phone_number TEXT;`;
    await sql`ALTER TABLE home_masjid.masjid_faculty DROP CONSTRAINT IF EXISTS masjid_faculty_pkey CASCADE;`;
    await sql`ALTER TABLE home_masjid.masjid_faculty ADD PRIMARY KEY (masjid_id, user_id);`;
    await sql`NOTIFY pgrst, 'reload schema'`;
    console.log('Altered successfully.');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
