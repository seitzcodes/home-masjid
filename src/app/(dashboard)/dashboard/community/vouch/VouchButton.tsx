"use client";

import { useState } from "react";
import { vouchForClaim } from "./actions";
import { ThumbsUp } from "lucide-react";

export function VouchButton({ claimId, masjidName }: { claimId: string; masjidName: string }) {
  const [isVouching, setIsVouching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVouch() {
    if (!confirm(`Are you sure you want to vouch for the claim on ${masjidName}? You should only do this if you personally know the person claiming this masjid.`)) {
      return;
    }

    setIsVouching(true);
    setError(null);
    
    const res = await vouchForClaim(claimId);
    if (res?.error) {
      setError(res.error);
      setIsVouching(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleVouch}
        disabled={isVouching}
        className="px-4 py-2 bg-primary hover:bg-primary-light text-primary-foreground rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50"
      >
        <ThumbsUp className="w-4 h-4" />
        {isVouching ? "Vouching..." : "Vouch for Claim"}
      </button>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
