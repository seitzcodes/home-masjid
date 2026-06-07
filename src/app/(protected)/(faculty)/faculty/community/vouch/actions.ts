"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function vouchForClaim(claimId: string, comments: string = "") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to vouch." };
  }

  const { error } = await (supabase as any).from("masjid_claim_vouches").insert({
    claim_id: claimId,
    vouching_user_id: user.id,
    comments: comments,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already vouched for this claim." };
    }
    console.error("Vouch error:", error);
    return { error: "Failed to submit vouch. Please try again." };
  }

  revalidatePath("/dashboard/community/vouch");
  return { success: true };
}
