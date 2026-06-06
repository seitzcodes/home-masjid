require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'home_masjid' } });

async function run() {
  const { data, error } = await supabase.from('masjids').select('*').limit(1);
  if (error) console.error(error);
  console.log('Sample masjid:', JSON.stringify(data[0], null, 2));
}

run();
