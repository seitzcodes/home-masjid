"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitClaim(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to claim a masjid." };
  }

  const masjidId = formData.get("masjidId") as string;
  const roleTitle = formData.get("roleTitle") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const documents = formData.getAll("documents") as File[];

  if (!masjidId || !roleTitle || !phoneNumber || documents.length === 0) {
    return { error: "All fields are required, including at least one verification document." };
  }

  // 1. Upload documents to Supabase Storage
  const filePaths: string[] = [];

  for (const doc of documents) {
    if (doc.size === 0) continue;
    
    const fileExt = doc.name.split('.').pop();
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('verification_documents')
      .upload(filePath, doc);

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { error: "Failed to upload one or more verification documents. Please try again." };
    }
    
    filePaths.push(filePath);
  }

  if (filePaths.length === 0) {
    return { error: "No valid documents were found." };
  }

  // 2. Insert into masjid_claims
  const { error: insertError } = await (supabase as any).from('masjid_claims')
    .insert({
      masjid_id: masjidId,
      user_id: user.id,
      role_title: roleTitle,
      phone_number: phoneNumber,
      proof_documents: filePaths as any, // Cast to any to bypass type check if types haven't been regenerated yet
      status: 'pending'
    });

  if (insertError) {
    console.error("Claim insert error:", insertError);
    return { error: "Failed to submit claim. Please try again." };
  }

  revalidatePath(`/masjids/${masjidId}`);
  redirect(`/masjids/${masjidId}?claimed=success`);
}
