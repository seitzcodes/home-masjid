import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendDonationReceipt } from "@/lib/mail/donation-receipt";

// Service-role client to bypass RLS for webhook-initiated mutations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "home_masjid" } }
);

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY is not configured");
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
  }

  // 1. Verify HMAC-SHA512 signature to prevent spoofing
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

  // ──────────────────────────────────────────────────────────
  // 2a. One-time donation succeeded
  // ──────────────────────────────────────────────────────────
  if (event.event === "charge.success") {
    return handleChargeSuccess(event.data);
  }

  // ──────────────────────────────────────────────────────────
  // 2b. Recurring Sadaqah Jariyah payment (Paystack subscription renewal)
  // ──────────────────────────────────────────────────────────
  if (event.event === "invoice.payment_success") {
    return handleInvoicePaymentSuccess(event.data);
  }

  // ──────────────────────────────────────────────────────────
  // 2c. Payment failed — mark donation as failed
  // ──────────────────────────────────────────────────────────
  if (event.event === "charge.failed") {
    const reference = event.data?.reference;
    if (reference) {
      await supabaseAdmin
        .from("donations")
        .update({ payment_status: "failed" })
        .eq("id", reference);
    }
    return NextResponse.json({ message: "Failure recorded" }, { status: 200 });
  }

  // Acknowledge any other event
  return NextResponse.json({ message: "Event ignored" }, { status: 200 });
}

// ─────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────

async function handleChargeSuccess(data: any) {
  const donationId = data.reference as string;
  const projectId = data.metadata?.project_id as string;
  const masjidId = data.metadata?.masjid_id as string;
  const amountZar = data.amount / 100;
  const donorEmail = data.customer?.email as string;

  if (!donationId || !projectId) {
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  try {
    // Idempotency: skip if already processed
    const { data: existing } = await supabaseAdmin
      .from("donations")
      .select("payment_status, is_recurring, is_anonymous, user_id")
      .eq("id", donationId)
      .single();

    if (!existing || existing.payment_status === "completed") {
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // Mark donation completed (atomic)
    const { error: donationError } = await supabaseAdmin
      .from("donations")
      .update({ payment_status: "completed" })
      .eq("id", donationId);

    if (donationError) throw donationError;

    // Atomically increment project funding total
    const { error: rpcError } = await supabaseAdmin.rpc("increment_project_amount", {
      p_id: projectId,
      amount: amountZar,
    });

    if (rpcError) throw rpcError;

    // Send receipt email (non-blocking — errors are swallowed in the helper)
    if (donorEmail && masjidId) {
      const [projectRes, masjidRes, profileRes] = await Promise.all([
        supabaseAdmin.from("projects").select("title").eq("id", projectId).single(),
        supabaseAdmin.from("masjids").select("name").eq("id", masjidId).single(),
        existing.user_id
          ? supabaseAdmin
              .from("user_profiles")
              .select("full_name")
              .eq("id", existing.user_id)
              .single()
          : Promise.resolve({ data: null }),
      ]);

      await sendDonationReceipt({
        to: donorEmail,
        donorName: profileRes.data?.full_name ?? undefined,
        amountZar,
        projectTitle: projectRes.data?.title ?? "Community Project",
        masjidName: masjidRes.data?.name ?? "your masjid",
        masjidId,
        reference: donationId,
        isRecurring: existing.is_recurring ?? false,
        date: new Date().toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    console.error("charge.success processing error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleInvoicePaymentSuccess(data: any) {
  // Paystack sends the subscription reference in data.subscription.email_token or data.reference
  const subscriptionCode = data.subscription?.subscription_code as string;
  const amountZar = data.amount / 100;
  const donorEmail = data.customer?.email as string;

  if (!subscriptionCode) {
    return NextResponse.json({ message: "No subscription code" }, { status: 200 });
  }

  try {
    // Find the original donation that set up this subscription
    // Paystack sends the plan_code — look up by plan to find masjid/project
    const planCode = data.plan?.plan_code as string;

    const { data: planRow } = await supabaseAdmin
      .from("paystack_plans")
      .select("project_id")
      .eq("plan_code", planCode)
      .maybeSingle();

    if (!planRow?.project_id) {
      return NextResponse.json({ message: "Plan not found in cache" }, { status: 200 });
    }

    const projectId = planRow.project_id;

    // Insert a new donation row for this recurring charge
    const { data: inserted } = await supabaseAdmin
      .from("donations")
      .insert({
        amount: amountZar,
        project_id: projectId,
        user_id: null, // subscription renewals are not tied to a session
        payment_status: "completed",
        is_recurring: true,
        is_anonymous: false,
      })
      .select("id")
      .single();

    // Atomically increment project total
    await supabaseAdmin.rpc("increment_project_amount", {
      p_id: projectId,
      amount: amountZar,
    });

    // Send receipt
    if (donorEmail) {
      const [projectRes, masjidRes] = await Promise.all([
        supabaseAdmin
          .from("projects")
          .select("title, masjid_id")
          .eq("id", projectId)
          .single(),
        supabaseAdmin
          .from("projects")
          .select("masjid_id")
          .eq("id", projectId)
          .single(),
      ]);

      const masjidId = projectRes.data?.masjid_id;
      const masjidRes2 = masjidId
        ? await supabaseAdmin.from("masjids").select("name").eq("id", masjidId).single()
        : null;

      await sendDonationReceipt({
        to: donorEmail,
        amountZar,
        projectTitle: projectRes.data?.title ?? "Community Project",
        masjidName: masjidRes2?.data?.name ?? "your masjid",
        masjidId: masjidId ?? "",
        reference: inserted?.id ?? subscriptionCode,
        isRecurring: true,
        date: new Date().toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
    }

    return NextResponse.json({ message: "Recurring donation recorded" }, { status: 200 });
  } catch (err) {
    console.error("invoice.payment_success processing error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
