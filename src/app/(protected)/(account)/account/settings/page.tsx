import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { SettingsForm } from "./SettingsForm";

export const metadata = {
  title: "Settings | Home Masjid",
};

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use raw any to fetch the new fields to bypass type mismatch before DB types regen
  const { data: profile } = await (supabase as any).from("user_profiles")
    .select(`
      full_name,
      username,
      is_profile_public,
      show_donations_publicly
    `)
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-500" /> Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage your personal information, privacy, and account security.
        </p>
      </div>

      <SettingsForm initialProfile={profile} userEmail={user.email || ""} />
    </div>
  );
}
