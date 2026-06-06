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
    const result = await sql`
      UPDATE home_masjid.user_profiles
      SET is_admin = true
      WHERE id = (SELECT id FROM auth.users WHERE email = 'byseitz.agency@gmail.com')
      RETURNING id;
    `;
    console.log('Admin user updated:', result);
  } catch (err) {
    console.error('Failed to set admin user:', err);
  } finally {
    process.exit(0);
  }
}

run();
