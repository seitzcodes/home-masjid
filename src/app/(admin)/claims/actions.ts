"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveClaim(claimId: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return { error: "Unauthorized" };

  // 1. Check if the current user is a superadmin
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_superadmin")
    .eq("id", session.user.id)
    .single();

  if (!profile || !profile.is_superadmin) return { error: "Unauthorized" };

  // 2. Fetch the claim details
  const { data: claim, error: claimError } = await supabase
    .from("masjid_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (claimError || !claim) return { error: "Claim not found" };

  // 3. Update the claim status
  const { error: updateError } = await supabase
    .from("masjid_claims")
    .update({ status: "approved" })
    .eq("id", claimId);

  if (updateError) return { error: "Failed to update claim status" };

  // 4. Insert into masjid_faculty to grant access
  if (claim.masjid_id && claim.user_id) {
    const { error: facultyError } = await supabase
      .from("masjid_faculty")
      .insert({
        masjid_id: claim.masjid_id,
        user_id: claim.user_id,
        role: "admin", // They claimed the masjid, so they get admin
      });

    if (facultyError) {
      console.error("Failed to insert into masjid_faculty:", facultyError);
      // Depending on strictness, we might want to rollback, but let's just log for now
    }

    // 5. Update the masjid to be verified
    await supabase
      .from("masjids")
      .update({ is_verified: true })
      .eq("id", claim.masjid_id);
  }

  // TODO: Send approval email via Resend to the claimant (claim.user_id)

  revalidatePath("/admin/claims");
  return { success: true };
}

export async function rejectClaim(claimId: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return { error: "Unauthorized" };

  // 1. Check if the current user is a superadmin
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_superadmin")
    .eq("id", session.user.id)
    .single();

  if (!profile || !profile.is_superadmin) return { error: "Unauthorized" };

  // 2. Update the claim status to rejected
  const { error: updateError } = await supabase
    .from("masjid_claims")
    .update({ status: "rejected" })
    .eq("id", claimId);

  if (updateError) return { error: "Failed to reject claim" };

  // TODO: Send rejection email via Resend

  revalidatePath("/admin/claims");
  return { success: true };
}
