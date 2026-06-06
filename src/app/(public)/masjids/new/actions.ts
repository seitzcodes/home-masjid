"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import tzlookup from "tz-lookup";

export async function createFacility(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const lat = parseFloat(formData.get("lat") as string);
  const lon = parseFloat(formData.get("lon") as string);
  const facilityType = (formData.get("facilityType") as string | null) as
    | "jumuah_masjid"
    | "daily_masjid"
    | "public_musalla"
    | "private_facility"
    | null;
  const isPublic = formData.get("isPublic") === "true";

  if (!name || isNaN(lat) || isNaN(lon)) {
    return { error: "Missing required fields" };
  }

  let timezone = null;
  try {
    timezone = tzlookup(lat, lon);
  } catch (e) {
    console.error("Error calculating timezone", e);
  }

  // Insert the new facility (unverified by default)
  const { data: masjid, error: insertError } = await (supabase as any).from("masjids")
    .insert({
      name,
      address,
      city,
      country,
      facility_type: facilityType ?? "jumuah_masjid",
      is_public_directory_listed: isPublic,
      is_verified: false,
      gps_location: `POINT(${lon} ${lat})`,
      timezone
    })
    .select()
    .single();

  if (insertError || !masjid) {
    console.error("Error creating facility:", insertError);
    return { error: "Failed to create facility. Please try again." };
  }

  // If user is logged in, automatically start a claim workflow
  if (user) {
    const { error: claimError } = await (supabase as any).from("masjid_claims")
      .insert({
        masjid_id: masjid.id,
        user_id: user.id,
        status: "pending",
        role_requested: "admin",
        proof_documents: []
      } as any);
    
    if (claimError) {
      console.error("Error creating claim:", claimError);
      // We don't fail the whole request, but we could log it
    }
  }

  // Redirect to the new unverified profile
  redirect(`/masjids/${masjid.id}`);
}
