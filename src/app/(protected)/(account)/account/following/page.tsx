import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Star } from "lucide-react";
import { redirect } from "next/navigation";
import MasjidPreviewCard from "@/components/masjids/MasjidPreviewCard";

export const metadata = {
  title: "Following | Home Masjid",
};

export default async function AccountFollowingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch followed masjids
  const { data: following } = await (supabase as any).from("masjid_followers")
    .select(`
      masjids (
        id,
        name,
        city,
        address,
        is_verified,
        gps_location,
        timezone
      )
    `)
    .eq("user_id", user.id);

  // Fetch home masjid id
  const { data: profile } = await (supabase as any).from("user_profiles")
    .select("home_masjid_id")
    .eq("id", user.id)
    .single();
    
  const homeMasjidId = profile?.home_masjid_id;

  const masjids = following?.map((f: any) => f.masjids).filter(Boolean) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Star className="w-8 h-8 text-amber-500" /> Following
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Masjids you are following for updates and your set Home Masjid.
        </p>
      </div>

      {masjids.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-500 shadow-sm">
          You are not following any masjids yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {masjids.map((masjid: any) => (
            <MasjidPreviewCard 
              key={masjid.id} 
              {...masjid} 
              isHome={homeMasjidId === masjid.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
