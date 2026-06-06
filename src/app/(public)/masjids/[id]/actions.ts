"use server";

import { createClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack/client";
import { getOrCreatePaystackPlan } from "@/lib/paystack/subscriptions";
import { redirect } from "next/navigation";

export async function initiateDonation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const projectId = formData.get("projectId") as string;
  const masjidId = formData.get("masjidId") as string;
  const amountStr = formData.get("amount") as string;
  const email = formData.get("email") as string;
  const isRecurring = formData.get("isRecurring") === "true";
  const isAnonymous = formData.get("isAnonymous") === "true";

  if (!projectId || !amountStr || !email) {
    return { error: "Missing required fields" };
  }

  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount < 10) {
    return { error: "Please enter a valid amount of at least R10." };
  }

  const amountCents = amount * 100;

  // Fetch project title for plan naming (recurring only, but cheap to always fetch)
  let projectTitle = "Community Project";
  try {
    const { data: project } = await (supabase as any).from("projects")
      .select("title")
      .eq("id", projectId)
      .single();
    if (project?.title) projectTitle = project.title;
  } catch {}

  // Generate a unique reference that becomes the donation row's primary key
  const donationId = crypto.randomUUID();

  // Insert pending donation record with all flags
  const { error: insertError } = await (supabase as any).from("donations").insert({
    id: donationId,
    amount,
    project_id: projectId,
    user_id: user?.id ?? null,
    payment_status: "pending",
    is_recurring: isRecurring,
    is_anonymous: isAnonymous,
  });

  if (insertError) {
    console.error("Donation insert error:", insertError);
    return { error: "Failed to initialize donation record" };
  }

  const host = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const callbackUrl = `${host}/masjids/${masjidId}?donation=success`;

  let authUrl = "";

  try {
    let planCode: string | undefined;

    // For recurring (Sadaqah Jariyah), get or create a Paystack monthly Plan
    if (isRecurring) {
      planCode = await getOrCreatePaystackPlan(projectId, amountCents, projectTitle);
    }

    const paystackRes = await initializeTransaction({
      amount: amountCents,
      email,
      reference: donationId,
      callback_url: callbackUrl,
      metadata: {
        project_id: projectId,
        masjid_id: masjidId,
        is_recurring: isRecurring,
        is_anonymous: isAnonymous,
      },
      // If recurring, pass the plan code so Paystack creates a subscription
      ...(planCode ? { plan: planCode } : {}),
    });

    authUrl = paystackRes.data.authorization_url;
  } catch (err: any) {
    console.error("Paystack API Error:", err);
    return { error: "Failed to connect to payment gateway" };
  }

  if (authUrl) {
    redirect(authUrl);
  } else {
    return { error: "Failed to get payment URL" };
  }
}
