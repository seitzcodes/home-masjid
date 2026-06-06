import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const connectionString = process.env.SUPABASE_SESSION_POOLER;
  if (!connectionString) throw new Error('SUPABASE_SESSION_POOLER is missing');

  const match = connectionString.match(/postgresql:\/\/([^:]+):(.*)@([^:]+):(\d+)\/(.*)/);
  if (!match) throw new Error('Invalid connection string');

  const [, user, password, host, port, database] = match;

  const sql = postgres({
    host, port: parseInt(port), database, username: user, password, ssl: 'require',
  });

  // Determine which files to run — accept optional CLI arg, else run all migrations
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const specificFile = process.argv[2];

  const files = specificFile
    ? [path.isAbsolute(specificFile) ? specificFile : path.join(migrationsDir, specificFile)]
    : fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort()
        .map(f => path.join(migrationsDir, f));

  for (const filePath of files) {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    console.log(`Applying: ${path.basename(filePath)}...`);
    try {
      await sql.unsafe(sqlContent);
      console.log(`  ✓ Done`);
    } catch (err: any) {
      console.error(`  ✗ Failed:`, err.message);
      process.exit(1);
    }
  }

  await sql.end();
  console.log('All migrations applied.');
}

main();

