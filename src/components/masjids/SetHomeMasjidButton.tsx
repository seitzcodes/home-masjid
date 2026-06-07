"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle } from "lucide-react";
import { setHomeMasjid } from "@/app/(public)/masjids/[id]/actions";

interface SetHomeMasjidButtonProps {
  masjidId: string;
  isHome: boolean;
  className?: string;
}

export function SetHomeMasjidButton({ masjidId, isHome, className }: SetHomeMasjidButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [currentIsHome, setCurrentIsHome] = useState(isHome);

  const handleSetHome = () => {
    if (currentIsHome) return; // already home
    
    startTransition(async () => {
      // Optimistic update
      setCurrentIsHome(true);
      
      const res = await setHomeMasjid(masjidId);
      
      if (res.error) {
        // Revert on error
        setCurrentIsHome(false);
        alert(res.error);
      }
    });
  };

  if (currentIsHome) {
    return (
      <button 
        disabled
        className={`px-4 py-2 border-2 border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 rounded-lg font-medium flex items-center justify-center gap-2 ${className || ""}`}
      >
        <CheckCircle className="w-4 h-4" /> Your Home Masjid
      </button>
    );
  }

  return (
    <button 
      onClick={handleSetHome}
      disabled={isPending}
      className={`px-4 py-2 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center justify-center gap-2 ${className || ""}`}
    >
      <CheckCircle className="w-4 h-4" /> Set as Home Masjid
    </button>
  );
}
