import { NextResponse } from 'next/server';
import { qstashClient } from '@/lib/qstash';

export async function POST(req: Request) {
  try {
    // 1. Verify the Supabase Webhook Secret (Basic verification)
    // In production, you would match this against a securely stored env variable
    const authHeader = req.headers.get('authorization');
    if (process.env.SUPABASE_WEBHOOK_SECRET && authHeader !== `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the payload from Supabase
    // Supabase sends a standard payload with `record` (new data), `old_record`, `type` (INSERT/UPDATE/DELETE), etc.
    const payload = await req.json();

    // We only care about INSERTs for notifications
    if (payload.type !== 'INSERT') {
      return NextResponse.json({ message: 'Ignored non-insert event' });
    }

    const programData = payload.record;

    if (!programData || !programData.masjid_id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 3. Push to Upstash QStash queue
    // Note: The destination URL MUST be publicly accessible for QStash to hit it.
    // We construct the absolute URL to our worker endpoint.
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = req.headers.get('host') || 'localhost:3000';
    const workerUrl = `${protocol}://${host}/api/workers/notify-followers`;

    // Publish the job. QStash will retry automatically if the worker fails.
    const messageId = await qstashClient.publishJSON({
      url: workerUrl,
      body: {
        event: 'new_program',
        program: programData,
        timestamp: new Date().toISOString()
      },
    });

    // 4. Immediately return 200 OK to Supabase
    return NextResponse.json({ success: true, messageId });
  } catch (error: any) {
    console.error('Error processing Supabase webhook:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
