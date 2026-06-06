"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Clock } from "lucide-react";

interface RealtimePostFeedProps {
  masjidId: string;
}

export default function RealtimePostFeed({ masjidId }: RealtimePostFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const supabase = createClient();

  // Load initial posts (mocked or actual)
  useEffect(() => {
    async function loadInitialPosts() {
      // Because we may not have the posts table completely seeded, 
      // we'll try to fetch, and if empty, we provide a placeholder.
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("masjid_id", masjidId)
        .order("created_at", { ascending: false })
        .limit(10);
        
      if (data && data.length > 0) {
        setPosts(data);
      }
    }
    loadInitialPosts();
  }, [masjidId, supabase]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "home_masjid",
          table: "posts",
          filter: `masjid_id=eq.${masjidId}`,
        },
        (payload) => {
          setPosts((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [masjidId, supabase]);

  return (
    <div className="space-y-6">
      {posts.length > 0 ? (
        posts.map((post, idx) => (
          <div key={post.id || idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Masjid Administration</h4>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : "Just now"}
                </div>
              </div>
            </div>
            
            <h5 className="font-bold text-lg mb-2">{post.title}</h5>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{post.content}</p>
            
            {/* Mock Comment Section */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
                <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                  Post
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-900 font-semibold mb-1">No Recent Posts</h3>
          <p className="text-slate-500 text-sm">Follow this masjid to be notified of future announcements.</p>
        </div>
      )}
    </div>
  );
}

// Ensure the icon is imported for the empty state
import { MessageSquare } from "lucide-react";
