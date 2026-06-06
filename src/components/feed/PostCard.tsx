"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock } from "lucide-react";

interface Post {
  post_id: string;
  masjid_id: string;
  masjid_name: string;
  author_id: string;
  author_name: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // Safe date formatting
  let timeAgo = "";
  try {
    timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  } catch (e) {
    timeAgo = "recently";
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0F172A] flex-shrink-0 flex items-center justify-center text-[#D4AF37] font-bold shadow-inner">
          {post.masjid_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/masjids/${post.masjid_id}`} className="font-semibold text-[#0F172A] hover:underline truncate block">
            {post.masjid_name}
          </Link>
          <div className="flex items-center text-xs text-slate-500 gap-2 mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo}
            </span>
            <span>&bull;</span>
            <span className="truncate">Posted by {post.author_name || "Admin"}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Optional Image */}
      {post.image_url && (
        <div className="w-full bg-slate-100 border-t border-slate-100">
          <div className="relative w-full aspect-video">
            <Image 
              src={post.image_url} 
              alt={`Post by ${post.masjid_name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 42rem"
            />
          </div>
        </div>
      )}
    </div>
  );
}
