"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfileSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to update settings." };
  }

  const fullName = formData.get("full_name") as string;
  let username = formData.get("username") as string;
  const isProfilePublic = formData.get("is_profile_public") === "on";
  const showDonationsPublicly = formData.get("show_donations_publicly") === "on";

  if (!fullName || fullName.trim().length === 0) {
    return { error: "Full Name is required." };
  }

  username = username?.trim().toLowerCase();
  
  if (username) {
    // Check if username is already taken by someone else
    const { data: existingUser } = await (supabase as any).from("user_profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .single();

    if (existingUser) {
      return { error: "Username is already taken." };
    }
  }

  const { error } = await (supabase as any).from("user_profiles")
    .update({
      full_name: fullName,
      username: username || null,
      is_profile_public: isProfilePublic,
      show_donations_publicly: showDonationsPublicly
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating settings:", error);
    return { error: "Failed to update settings. Please try again." };
  }

  revalidatePath("/account/settings");
  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to delete your account." };
  }

  // To delete a user, we must use the Supabase Admin API
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error("Error deleting user account:", deleteError);
    return { error: "Failed to delete account. Please contact support." };
  }

  // Sign out the user locally to clear the session cookie
  await supabase.auth.signOut();
  
  redirect("/");
}
