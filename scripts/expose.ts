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
    await sql`ALTER ROLE authenticator SET pgrst.db_schemas = 'public, storage, graphql_public, home_masjid'`;
    await sql`NOTIFY pgrst, 'reload schema'`;
    console.log('Schema exposed successfully');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
