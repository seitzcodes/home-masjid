"use client";

import { useState } from "react";
import { X, CheckCircle, Share2 } from "lucide-react";

export function DonationSuccessBanner({ masjidName }: { masjidName: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `I supported ${masjidName}`,
        text: `I just donated to a community project at ${masjidName} via Home Masjid. Join me in supporting our local masjid! 🕌`,
        url: window.location.href.split("?")[0],
      });
    } else {
      navigator.clipboard.writeText(window.location.href.split("?")[0]);
    }
  }

  return (
    <div className="sticky top-16 z-30 w-full bg-gradient-to-r from-[#D4AF37] to-[#b8942c] text-[#0F172A] shadow-lg animate-in slide-in-from-top duration-300">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0F172A]/10 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-[#0F172A]" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight">JazakAllah Khayran! 🤲</p>
            <p className="text-sm opacity-80 leading-tight">
              Your donation to <span className="font-semibold">{masjidName}</span> has been confirmed. A receipt has been sent to your email.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A]/10 hover:bg-[#0F172A]/20 rounded-lg text-sm font-medium transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 hover:bg-[#0F172A]/10 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
