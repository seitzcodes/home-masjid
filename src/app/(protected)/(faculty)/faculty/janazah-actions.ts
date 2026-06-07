"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveJanazah(id: string) {
  const supabase = await createClient();
  
  // RLS will ensure only faculty can update this row
  const { error } = await (supabase as any)
    .from("janazahs")
    .update({ status: 'approved' })
    .eq("id", id);
    
  if (error) {
    console.error("Error approving Janazah:", error);
    return { error: error.message };
  }
  
  revalidatePath("/faculty");
  return { success: true };
}

export async function rejectJanazah(id: string) {
  const supabase = await createClient();
  
  const { error } = await (supabase as any)
    .from("janazahs")
    .update({ status: 'rejected' })
    .eq("id", id);
    
  if (error) {
    console.error("Error rejecting Janazah:", error);
    return { error: error.message };
  }
  
  revalidatePath("/faculty");
  return { success: true };
}
