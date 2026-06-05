const postgres = require('postgres');
const sql = postgres(process.env.SUPABASE_SESSION_POOLER);

async function run() {
  try {
    await sql`ALTER ROLE authenticator SET pgrst.db_schemas = 'public, storage, graphql_public, home_masjid';`;
    await sql`NOTIFY pgrst, 'reload schema'`;
    console.log('Schema exposed');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
