"use client";

import React, { useState, useTransition } from "react";
import { Users, Check } from "lucide-react";
import { toggleFollowMasjid } from "@/app/(public)/masjids/[id]/actions";

interface FollowMasjidButtonProps {
  masjidId: string;
  initialFollowing: boolean;
  className?: string;
}

export function FollowMasjidButton({ masjidId, initialFollowing, className }: FollowMasjidButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);

  const handleToggle = () => {
    startTransition(async () => {
      // Optimistic update
      setIsFollowing(!isFollowing);
      
      const res = await toggleFollowMasjid(masjidId);
      
      if (res.error) {
        // Revert on error
        setIsFollowing(isFollowing);
        alert(res.error);
      } else if (res.success) {
        setIsFollowing(res.following!);
      }
    });
  };

  if (isFollowing) {
    return (
      <button 
        onClick={handleToggle}
        disabled={isPending}
        className={`px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 ${className || ""}`}
      >
        <Check className="w-4 h-4" /> Following
      </button>
    );
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`px-5 py-2.5 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 ${className || ""}`}
    >
      <Users className="w-4 h-4" /> Follow Updates
    </button>
  );
}
