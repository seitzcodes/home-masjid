"use client";

import { useState } from "react";
import { approveClaim, rejectClaim } from "./actions";
import { CheckCircle, XCircle } from "lucide-react";

export function ClaimActions({ claimId }: { claimId: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    if (!confirm("Are you sure you want to approve this claim? This will grant the user faculty access to the masjid.")) return;
    
    setIsProcessing(true);
    setError(null);
    const res = await approveClaim(claimId);
    if (res?.error) setError(res.error);
    setIsProcessing(false);
  }

  async function handleReject() {
    if (!confirm("Are you sure you want to reject this claim? This action is permanent.")) return;
    
    setIsProcessing(true);
    setError(null);
    const res = await rejectClaim(claimId);
    if (res?.error) setError(res.error);
    setIsProcessing(false);
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleApprove}
        disabled={isProcessing}
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
      >
        <CheckCircle className="w-4 h-4" />
        {isProcessing ? "Processing..." : "Approve Claim"}
      </button>
      
      <button
        onClick={handleReject}
        disabled={isProcessing}
        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50"
      >
        <XCircle className="w-4 h-4" />
        Reject
      </button>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
