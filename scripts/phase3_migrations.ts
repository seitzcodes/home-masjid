import postgres from 'postgres';

const sql = postgres({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mwxcokklqsrxjlcrendq',
  password: 'fyP%kjwbQK9K5p&'
});

async function run() {
  console.log('Running Phase 3 migrations...');
  try {
    // 1. Add is_admin to user_profiles
    await sql`
      ALTER TABLE home_masjid.user_profiles 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
    `;
    console.log('Added is_admin to user_profiles');

    // 2. Create masjid_claims table
    await sql`
      CREATE TABLE IF NOT EXISTS home_masjid.masjid_claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role_title TEXT NOT NULL,
        phone_number TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;
    console.log('Created masjid_claims table');

    // 3. Create masjid_faculty table
    await sql`
      CREATE TABLE IF NOT EXISTS home_masjid.masjid_faculty (
        masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (masjid_id, user_id)
      );
    `;
    console.log('Created masjid_faculty table');

    // 4. Create masjid_reports table
    await sql`
      CREATE TABLE IF NOT EXISTS home_masjid.masjid_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
        reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        reason TEXT NOT NULL,
        details TEXT,
        status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;
    console.log('Created masjid_reports table');

    // Enable RLS
    await sql`ALTER TABLE home_masjid.masjid_claims ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE home_masjid.masjid_faculty ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE home_masjid.masjid_reports ENABLE ROW LEVEL SECURITY;`;
    console.log('Enabled RLS on new tables');

    // RLS Policies for masjid_claims
    // Users can view their own claims.
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Users can view own claims" ON home_masjid.masjid_claims FOR SELECT USING (auth.uid() = user_id);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `;
    // Users can insert their own claims.
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Users can insert own claims" ON home_masjid.masjid_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `;
    // Admins can do everything on claims.
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Admins can view all claims" ON home_masjid.masjid_claims FOR SELECT USING (
          EXISTS (SELECT 1 FROM home_masjid.user_profiles WHERE id = auth.uid() AND is_admin = true)
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `;
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Admins can update all claims" ON home_masjid.masjid_claims FOR UPDATE USING (
          EXISTS (SELECT 1 FROM home_masjid.user_profiles WHERE id = auth.uid() AND is_admin = true)
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `;

    // RLS Policies for masjid_faculty
    // Public can view faculty
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Public can view faculty" ON home_masjid.masjid_faculty FOR SELECT USING (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `;
    // Only admins or faculty admins can insert/update/delete faculty (simplified for now: just admins)
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Admins can manage faculty" ON home_masjid.masjid_faculty FOR ALL USING (
          EXISTS (SELECT 1 FROM home_masjid.user_profiles WHERE id = auth.uid() AND is_admin = true)
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `;

    // RLS Policies for masjid_reports
    // Anyone (even anon if we allow it, but let's restrict to authenticated) can insert reports
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Authenticated users can insert reports" ON home_masjid.masjid_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `;
    // Admins can manage reports
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Admins can manage reports" ON home_masjid.masjid_reports FOR ALL USING (
          EXISTS (SELECT 1 FROM home_masjid.user_profiles WHERE id = auth.uid() AND is_admin = true)
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `;

    // Update masjids RLS to allow faculty to update
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Faculty can update their masjid" ON home_masjid.masjids FOR UPDATE USING (
          EXISTS (SELECT 1 FROM home_masjid.masjid_faculty WHERE masjid_id = id AND user_id = auth.uid())
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `;

    await sql`NOTIFY pgrst, 'reload schema'`;
    console.log('Schema reloaded successfully.');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

run();
