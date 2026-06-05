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
    // Check existing policies
    const policies = await sql`SELECT policyname FROM pg_policies WHERE tablename = 'masjids'`;
    console.log('Existing policies on masjids:', policies);
    
    // Create the policy
    await sql`
      CREATE POLICY "Allow public read access on masjids" 
      ON home_masjid.masjids FOR SELECT 
      USING (true);
    `;
    console.log('Policy created successfully.');
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      console.log('Policy already exists, ignoring.');
    } else {
      console.error(err);
    }
  } finally {
    process.exit(0);
  }
}

run();
