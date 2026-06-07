"use server"

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function submitJanazahNotice(masjidId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to report a Janazah." };
  }

  // Check if user is faculty. If faculty, automatically approve.
  const { data: faculty } = await (supabase as any)
    .from("masjid_faculty")
    .select("masjid_id")
    .eq("user_id", user.id)
    .eq("masjid_id", masjidId)
    .single();

  const isFaculty = !!faculty;
  const status = isFaculty ? 'approved' : 'pending';

  const deceased_name = formData.get("deceased_name") as string;
  const date_of_passing = formData.get("date_of_passing") as string;
  const janazah_time = formData.get("janazah_time") as string;
  const burial_location = formData.get("burial_location") as string;
  const notes = formData.get("notes") as string;

  if (!deceased_name || !date_of_passing || !janazah_time) {
    return { error: "Missing required fields." };
  }

  const { error } = await (supabase as any).from("janazahs").insert({
    masjid_id: masjidId,
    reported_by: user.id,
    deceased_name,
    date_of_passing,
    janazah_time,
    burial_location,
    notes,
    status
  });

  if (error) {
    console.error("Janazah submission error:", error);
    return { error: error.message };
  }

  // Use a query param to show a success toast on the destination page
  redirect(`/masjids/${masjidId}?janazah_reported=true`);
}
