const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
async function run() {
  const client = new Client({ connectionString: process.env.SUPABASE_SESSION_POOLER });
  await client.connect();
  console.log('Connected to DB');
  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log('Schema reload triggered');
  await client.end();
}
run().catch(console.error);
