import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PostCard from "@/components/feed/PostCard";
import { BellRing, ShieldCheck, Rss } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "My Feed | Home Masjid",
  description: "Stay connected with announcements and updates from your home masjid and communities you follow.",
};

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/feed");
  }

  // Fetch the user's unified feed using the RPC
  const { data: feedData, error } = await (supabase as any).rpc("get_user_feed", {
    req_user_id: user.id,
    limit_count: 50
  });

  const posts = feedData || [];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#0F172A] p-2 rounded-lg">
            <Rss className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">My Feed</h1>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post: any) => (
              <PostCard 
                key={post.post_id} 
                post={post} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <BellRing className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">It's quiet here...</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              You'll see updates here from your Home Masjid and any other communities you follow.
            </p>
            <Link 
              href="/masjids"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#0F172A] text-white font-medium hover:bg-slate-800 transition-colors"
            >
              Explore Masjids
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
