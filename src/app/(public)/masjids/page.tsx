import React from "react";
import { createClient } from "@/lib/supabase/server";
import DirectoryClientLayout from "@/components/masjids/DirectoryClientLayout";

export const revalidate = 3600; // Revalidate every hour

export const metadata = {
  title: "Explore Masjids | Home Masjid",
  description: "Discover verified masjids around the world and stay connected with your local community.",
};

export default async function MasjidsDirectoryPage() {
  const supabase = await createClient();
  
  // Fetch initial base list (first 50) for fast SSR
  const { data: initialMasjids } = await supabase
    .from("masjids")
    .select("*")
    .limit(50);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <DirectoryClientLayout initialMasjids={initialMasjids || []} />
    </div>
  );
}
