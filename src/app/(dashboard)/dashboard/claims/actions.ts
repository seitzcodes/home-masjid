"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveClaim(claimId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify superadmin
  const { data: profile } = await (supabase as any).from("user_profiles").select("is_superadmin").eq("id", user.id).single();
  if (!profile?.is_superadmin) return { error: "Unauthorized" };

  // Fetch the claim
  const { data: claim, error: claimError } = await (supabase as any).from("masjid_claims").select("*").eq("id", claimId).single();
  if (claimError || !claim) return { error: "Claim not found." };

  // 1. Insert into masjid_faculty
  const { error: facultyError } = await (supabase as any).from("masjid_faculty").insert({
    masjid_id: claim.masjid_id,
    user_id: claim.user_id,
    role_title: claim.role_title,
    is_primary_contact: true,
  });

  if (facultyError && facultyError.code !== '23505') { // ignore duplicate key if they're already faculty somehow
    console.error("Error adding faculty:", facultyError);
    return { error: "Failed to add user to faculty." };
  }

  // 2. Update claim status
  await (supabase as any).from("masjid_claims").update({ status: "approved" }).eq("id", claimId);

  // 3. Mark masjid as verified
  await (supabase as any).from("masjids").update({ is_verified: true }).eq("id", claim.masjid_id);

  revalidatePath("/dashboard/claims");
  return { success: true };
}

export async function rejectClaim(claimId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify superadmin
  const { data: profile } = await (supabase as any).from("user_profiles").select("is_superadmin").eq("id", user.id).single();
  if (!profile?.is_superadmin) return { error: "Unauthorized" };

  // Update claim status
  const { error } = await (supabase as any).from("masjid_claims").update({ status: "rejected" }).eq("id", claimId);
  if (error) return { error: "Failed to reject claim." };

  revalidatePath("/dashboard/claims");
  return { success: true };
}
