const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:fyP%25kjwbQK9K5p%26@db.mwxcokklqsrxjlcrendq.supabase.co:5432/postgres' });
  await client.connect();
  console.log('Connected to DB direct');
  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log('Schema reload triggered');
  await client.end();
}
run().catch(console.error);
