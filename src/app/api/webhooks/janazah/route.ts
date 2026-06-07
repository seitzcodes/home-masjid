import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// import { Resend } from "resend"; // Assuming Resend is configured, we can mock it or use it if available.

// const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const janazah = payload.record;

    if (!janazah || janazah.status !== 'approved') {
      return NextResponse.json({ message: "Ignored" }, { status: 200 });
    }

    // Process notification fan-out asynchronously
    // In production, push this to a queue like Inngest/QStash. 
    // For now, we fire and forget.
    processNotifications(janazah).catch(console.error);

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (err) {
    console.error("Janazah webhook error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function processNotifications(janazah: any) {
  console.log("Processing Janazah Fan-out for:", janazah.deceased_name);
  
  // 1. Fetch Masjid Details
  const { data: masjid } = await supabaseAdmin.from("masjids")
    .select("name, city")
    .eq("id", janazah.masjid_id)
    .single();

  if (!masjid) return;

  // 2. Fetch target audience: Users whose home_masjid is this, or who follow this masjid
  // We can query user_profiles and masjid_followers.
  // For simplicity, let's just fetch all users who follow or have it as home.
  const { data: homeUsers } = await supabaseAdmin.from("user_profiles")
    .select("id")
    .eq("home_masjid_id", janazah.masjid_id);

  const { data: followers } = await supabaseAdmin.from("masjid_followers")
    .select("user_id")
    .eq("masjid_id", janazah.masjid_id);

  const uniqueUserIds = new Set<string>();
  homeUsers?.forEach(u => uniqueUserIds.add(u.id));
  followers?.forEach(f => uniqueUserIds.add(f.user_id));

  // In a real app, we would join with auth.users to get their email addresses
  // For the sake of the prototype, we simulate dispatching the emails:
  console.log(`Dispatching Urgent Janazah Emails to ${uniqueUserIds.size} users.`);
  
  /* Example Resend integration:
  if (uniqueUserIds.size > 0 && process.env.RESEND_API_KEY) {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const targetEmails = usersData.users.filter(u => uniqueUserIds.has(u.id)).map(u => u.email);
    
    // Batch send emails...
  }
  */

  // 3. Dispatch Supabase Realtime Toast Alert
  // We broadcast on a channel that clients listen to
  await supabaseAdmin.channel(`janazah_alerts_${janazah.masjid_id}`).send({
    type: 'broadcast',
    event: 'new_janazah',
    payload: {
      masjidName: masjid.name,
      deceasedName: janazah.deceased_name,
      time: janazah.janazah_time,
      location: janazah.burial_location
    }
  });

  console.log("Janazah Realtime alert broadcasted.");
}
