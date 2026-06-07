"use client";

import React, { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Clock, Heart, MessageSquare, Send } from "lucide-react";
import { toggleLike, submitComment } from "@/app/(public)/masjids/[id]/feed-actions";
import { toast } from "sonner";

interface RealtimePostFeedProps {
  masjidId: string;
}

export default function RealtimePostFeed({ masjidId }: RealtimePostFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data } = await (supabase as any).from("posts")
        .select(`
          *,
          author:user_profiles (full_name, username, is_profile_public),
          comments (
            id, 
            content, 
            created_at, 
            user:user_profiles (full_name, username, is_profile_public)
          ),
          post_likes (id, user_id)
        `)
        .eq("masjid_id", masjidId)
        .order("created_at", { ascending: false })
        .limit(20);
        
      if (data) {
        setPosts(data);
      }
    }
    init();
  }, [masjidId, supabase]);

  // Handle optimistic liking
  const handleLike = async (postId: string) => {
    if (!currentUser) {
      toast.error("Please log in to like posts.");
      return;
    }

    // Optimistic UI update
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const hasLiked = post.post_likes.some((l: any) => l.user_id === currentUser.id);
        const newLikes = hasLiked 
          ? post.post_likes.filter((l: any) => l.user_id !== currentUser.id)
          : [...post.post_likes, { user_id: currentUser.id }];
        return { ...post, post_likes: newLikes };
      }
      return post;
    }));

    startTransition(async () => {
      const res = await toggleLike(postId);
      if (res.error) toast.error(res.error);
    });
  };

  const handleComment = async (postId: string) => {
    if (!currentUser) {
      toast.error("Please log in to comment.");
      return;
    }

    const content = commentInputs[postId];
    if (!content?.trim()) return;

    // Optimistic UI update for comments
    const newComment = {
      id: Math.random().toString(),
      content: content.trim(),
      created_at: new Date().toISOString(),
      user: {
        full_name: "You",
        username: null,
        is_profile_public: false
      }
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));
    
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));

    startTransition(async () => {
      const res = await submitComment(postId, content);
      if (res.error) toast.error(res.error);
    });
  };

  const getAuthorName = (profile: any) => {
    if (!profile) return "Masjid Administration";
    if (profile.is_profile_public && profile.username) return `@${profile.username}`;
    if (profile.is_profile_public) return profile.full_name;
    return "Anonymous Member";
  };

  return (
    <div className="space-y-6">
      {posts.length > 0 ? (
        posts.map((post) => {
          const hasLiked = currentUser && post.post_likes.some((l: any) => l.user_id === currentUser.id);
          const likeCount = post.post_likes.length;
          const commentCount = post.comments?.length || 0;
          const isCommentsExpanded = expandedComments[post.id];

          return (
            <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{getAuthorName(post.author)}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : "Just now"}
                  </div>
                </div>
              </div>
              
              {post.title && <h5 className="font-bold text-lg mb-2">{post.title}</h5>}
              <p className="text-slate-700 text-sm whitespace-pre-wrap">{post.content}</p>

              {/* Engagement Bar */}
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${hasLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                >
                  <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                  {likeCount}
                </button>
                <button 
                  onClick={() => setExpandedComments(prev => ({...prev, [post.id]: !prev[post.id]}))}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  {commentCount}
                </button>
              </div>
              
              {/* Comment Section */}
              {isCommentsExpanded && (
                <div className="mt-4 space-y-4">
                  {/* List Comments */}
                  <div className="space-y-3">
                    {post.comments?.map((comment: any) => (
                      <div key={comment.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                        <span className="font-semibold block mb-1">
                          {getAuthorName(comment.user)}
                        </span>
                        <p className="text-slate-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleComment(post.id);
                      }}
                      placeholder="Add a comment..." 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button 
                      onClick={() => handleComment(post.id)}
                      disabled={isPending}
                      className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
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
