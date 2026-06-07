"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, MoreVertical, Flag, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { submitContentReport } from "@/app/actions/moderation";

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

  const [menuOpen, setMenuOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportStatus("submitting");
    const result = await submitContentReport(post.post_id, 'post', reportReason);
    if (result.error) {
      setReportStatus("error");
    } else {
      setReportStatus("success");
      setTimeout(() => {
        setIsReporting(false);
        setReportStatus("idle");
        setReportReason("");
      }, 2000);
    }
  };

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
        
        {/* Actions Menu */}
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
              <button 
                onClick={() => {
                  setMenuOpen(false);
                  setIsReporting(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Flag className="w-4 h-4" /> Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      {isReporting && (
        <div className="px-4 pb-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" /> Report Content
            </h4>
            {reportStatus === "success" ? (
              <p className="text-sm text-green-700">Thank you. Your report has been submitted for review.</p>
            ) : (
              <form onSubmit={handleReport}>
                <textarea 
                  required
                  placeholder="Why are you reporting this post? (e.g., spam, inappropriate content)"
                  className="w-full text-sm p-2 border border-orange-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400 mb-2"
                  rows={2}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setIsReporting(false)}
                    className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={reportStatus === "submitting"}
                    className="px-3 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded disabled:opacity-50"
                  >
                    {reportStatus === "submitting" ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
                {reportStatus === "error" && <p className="text-xs text-red-600 mt-2">Failed to submit. Please try again.</p>}
              </form>
            )}
          </div>
        </div>
      )}

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
