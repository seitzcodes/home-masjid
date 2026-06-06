"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitClaim(formData: FormData) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "You must be logged in to claim a masjid." };
  }

  const masjidId = formData.get("masjidId") as string;
  const roleTitle = formData.get("roleTitle") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const documentFile = formData.get("document") as File;

  if (!masjidId || !roleTitle || !phoneNumber || !documentFile || documentFile.size === 0) {
    return { error: "All fields are required, including a verification document." };
  }

  // 1. Upload document to Supabase Storage
  const fileExt = documentFile.name.split('.').pop();
  // Using the user's ID as the folder name allows the RLS policy to work correctly
  const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('verification_documents')
    .upload(filePath, documentFile);

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return { error: "Failed to upload verification document. Please try again." };
  }

  // 2. Insert into masjid_claims
  const { error: insertError } = await supabase
    .from('masjid_claims')
    .insert({
      masjid_id: masjidId,
      user_id: session.user.id,
      role_title: roleTitle,
      phone_number: phoneNumber,
      proof_documents: filePath,
      status: 'pending'
    });

  if (insertError) {
    console.error("Claim insert error:", insertError);
    return { error: "Failed to submit claim. Please try again." };
  }

  revalidatePath(`/masjids/${masjidId}`);
  redirect(`/masjids/${masjidId}?claimed=success`);
}
