/**
 * Paystack Subscriptions helper.
 *
 * Paystack Subscriptions require a named "Plan" to be created first, then the
 * transaction initialization passes the plan code — Paystack handles recurring billing.
 *
 * We cache plans in `home_masjid.paystack_plans` to avoid re-creating them on
 * every donation (Paystack's API rate limits and plan deduplication make caching essential).
 */

import { createClient as createAdminClient } from "@supabase/supabase-js";

// We need service_role to read/write the plans cache
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "home_masjid" } }
);

/**
 * Retrieve an existing Paystack monthly plan for a (project, amount) pair,
 * or create one via the Paystack API and cache it.
 *
 * @param projectId  - UUID of the project being supported
 * @param amountCents - Donation amount in cents (ZAR kobo), e.g. 25000 = R250
 * @param projectTitle - Human-readable title used as the Paystack plan name
 * @returns The Paystack plan_code (e.g. "PLN_abc123")
 */
export async function getOrCreatePaystackPlan(
  projectId: string,
  amountCents: number,
  projectTitle: string
): Promise<string> {
  // 1. Check cache first
  const { data: cached } = await supabaseAdmin
    .from("paystack_plans")
    .select("plan_code")
    .eq("project_id", projectId)
    .eq("amount_cents", amountCents)
    .maybeSingle();

  if (cached?.plan_code) {
    return cached.plan_code;
  }

  // 2. Create plan on Paystack
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is not defined");

  const planName = `Sadaqah Jariyah — ${projectTitle} (R${amountCents / 100}/mo)`;

  const response = await fetch("https://api.paystack.co/plan", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: planName,
      amount: amountCents,
      interval: "monthly",
      currency: "ZAR",
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.data?.plan_code) {
    throw new Error(data.message || "Failed to create Paystack plan");
  }

  const planCode: string = data.data.plan_code;

  // 3. Cache the plan code
  await supabaseAdmin.from("paystack_plans").upsert({
    project_id: projectId,
    amount_cents: amountCents,
    plan_code: planCode,
  });

  return planCode;
}
