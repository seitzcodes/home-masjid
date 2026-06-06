import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// We need a server-role client here to bypass RLS when updating donations via webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY is not configured");
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
  }

  // 1. Verify Signature
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const bodyText = await req.text();
  const hash = crypto.createHmac("sha512", secretKey).update(bodyText).digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(bodyText);

  // 2. Handle charge.success
  if (event.event === "charge.success") {
    const data = event.data;
    const donationId = data.reference;
    const projectId = data.metadata?.project_id;
    // Paystack sends amount in cents/kobo, convert back to full ZAR
    const amountZar = data.amount / 100;

    if (!donationId || !projectId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      // Begin logical transaction using RPC, or dual queries if RPC is not available.
      // Since we don't have a specific RPC defined for this, we will do dual queries securely using service_role.

      // Check if donation is already processed to prevent double counting
      const { data: existingDonation } = await supabaseAdmin
        .from("donations")
        .select("payment_status")
        .eq("id", donationId)
        .single();

      if (!existingDonation || existingDonation.payment_status === "completed") {
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }

      // Update Donation Status
      const { error: donationError } = await supabaseAdmin
        .from("donations")
        .update({ payment_status: "completed" })
        .eq("id", donationId);

      if (donationError) throw donationError;

      // Fetch current project amount to increment safely (Supabase RPC is better for concurrency, but we'll read/update for now)
      // If we had an RPC: await supabaseAdmin.rpc('increment_project_amount', { p_id: projectId, amount: amountZar })
      
      const { data: project } = await supabaseAdmin
        .from("projects")
        .select("current_amount")
        .eq("id", projectId)
        .single();

      const newAmount = (project?.current_amount || 0) + amountZar;

      const { error: projectError } = await supabaseAdmin
        .from("projects")
        .update({ current_amount: newAmount })
        .eq("id", projectId);

      if (projectError) throw projectError;

      // TODO: (Phase 9 Integration) If we want, we could trigger a real-time toast that someone just donated!

      return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (err) {
      console.error("Webhook processing error:", err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  // Acknowledge other events
  return NextResponse.json({ message: "Event ignored" }, { status: 200 });
}
