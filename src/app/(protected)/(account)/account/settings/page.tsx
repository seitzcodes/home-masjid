import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Settings, User, Building2 } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Settings | Home Masjid",
};

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await (supabase as any).from("user_profiles")
    .select(`
      full_name,
      phone,
      home_masjid_id,
      masjids (
        name,
        city
      )
    `)
    .eq("id", user.id)
    .single();

  const homeMasjid = profile?.masjids;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-500" /> Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        
        {/* Profile Section */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                {profile?.full_name || "Not set"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                {user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Home Masjid Section */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Home Masjid</h2>
          </div>
          
          {homeMasjid ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{homeMasjid.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{homeMasjid.city}</p>
              </div>
              <Link href={`/masjids/${profile.home_masjid_id}`} className="text-sm font-medium text-[#D4AF37] hover:underline">
                View Profile
              </Link>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500">
              You haven't set a Home Masjid yet. <Link href="/masjids" className="text-[#D4AF37] hover:underline font-medium">Find one near you.</Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
