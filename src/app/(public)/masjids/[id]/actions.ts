"use server";

import { createClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack/client";
import { redirect } from "next/navigation";

export async function initiateDonation(formData: FormData) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const projectId = formData.get("projectId") as string;
  const masjidId = formData.get("masjidId") as string;
  const amountStr = formData.get("amount") as string;
  const email = formData.get("email") as string;

  if (!projectId || !amountStr || !email) {
    return { error: "Missing required fields" };
  }

  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Invalid amount" };
  }

  // Generate a unique ID for the donation record, which will be our Paystack reference
  const donationId = crypto.randomUUID();

  // Insert pending donation
  const { error: insertError } = await supabase
    .from("donations")
    .insert({
      id: donationId,
      amount: amount,
      project_id: projectId,
      user_id: session?.user?.id || null,
      payment_status: "pending",
    });

  if (insertError) {
    console.error("Donation insert error:", insertError);
    return { error: "Failed to initialize donation record" };
  }

  let authUrl = "";

  try {
    // Paystack expects amount in cents (or kobo, etc). For ZAR, multiply by 100
    const amountInCents = amount * 100;

    const host = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const callbackUrl = `${host}/masjids/${masjidId}?donation=success`;

    const paystackRes = await initializeTransaction({
      amount: amountInCents,
      email: email,
      reference: donationId,
      callback_url: callbackUrl,
      metadata: {
        project_id: projectId,
        masjid_id: masjidId,
      },
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
