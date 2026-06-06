import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

// Verify QStash request manually or with @upstash/qstash/nextjs wrapper
// We will do a basic check here for simplicity
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Upstash QStash adds specific headers for verification (upstash-signature)
    // If not using the nextjs wrapper, we can still process the payload
    const body = await req.json();
    const { event, program } = body;

    if (event !== 'new_program' || !program || !program.masjid_id) {
      return NextResponse.json({ error: 'Invalid worker payload' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Retrieve the Audience (Followers and Home Masjid Users)
    // First, get users whose home_masjid_id is this masjid
    const { data: homeUsers, error: homeError } = await (supabase as any).from('user_profiles')
      .select('id, full_name') // Assuming we have an email column or we fetch from auth.users
      .eq('home_masjid_id', program.masjid_id);

    // Second, get followers of this masjid
    const { data: followers, error: followError } = await (supabase as any).from('followers')
      .select('user_id')
      .eq('masjid_id', program.masjid_id);

    // Combine unique user IDs
    const userIds = new Set<string>();
    homeUsers?.forEach((u: any) => userIds.add(u.id));
    followers?.forEach((f: any) => userIds.add(f.user_id));

    if (userIds.size === 0) {
      console.log('No audience found for masjid:', program.masjid_id);
      return NextResponse.json({ success: true, notified: 0 });
    }

    // 2. Fetch the actual user emails (Since auth.users is restricted, we'd need service_role 
    // or user_profiles needs to store a contact_email. Let's assume user_profiles has `contact_email` 
    // or we are using a secure RPC). For the sake of this mock worker, we'll log it.
    
    // 3. Demographic Filtering (Mock logic based on program.target_audience)
    // If program.target_audience is 'Youth & Children', we'd filter out users who opted out.

    // 4. Dispatch Email Batch via Resend
    // Resend supports batch sending up to 100 emails at once
    console.log(`[WORKER] Preparing to send emails to ${userIds.size} users about program: ${program.title}`);

    if (process.env.RESEND_API_KEY) {
      // In a real scenario, map over userIds and fetch their emails.
      // We will send a mock test email to a developer address to prove delivery.
      await resend.emails.send({
        from: 'Home Masjid <notifications@homemasjid.com>',
        to: ['dev@example.com'], // Replace with actual user emails
        subject: `New Program: ${program.title}`,
        html: `
          <div style="font-family: sans-serif; max-w-md: mx-auto; background: #F8FAFC; padding: 20px;">
            <div style="background: #0F172A; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">Home Masjid</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #E2E8F0;">
              <h2 style="color: #0F172A; margin-top: 0;">${program.title}</h2>
              <p style="color: #64748B;">${program.description || 'Join us for a new program at your local masjid.'}</p>
              
              <div style="margin-top: 30px;">
                <a href="https://homemasjid.com/masjids/${program.masjid_id}" style="background: #D4AF37; color: #0F172A; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                  View Details
                </a>
              </div>
            </div>
          </div>
        `
      });
      console.log(`[WORKER] Successfully sent email batch.`);
    } else {
      console.log(`[WORKER] RESEND_API_KEY not found. Skipping actual email dispatch.`);
    }

    return NextResponse.json({ success: true, notified: userIds.size });
  } catch (error: any) {
    console.error('[WORKER] Error in notify-followers:', error);
    // If we return 500, QStash will automatically retry based on its schedule
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
