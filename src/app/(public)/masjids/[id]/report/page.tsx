"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Flag, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ReportMasjidPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [masjid, setMasjid] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    async function fetchMasjid() {
      const supabase = createClient();
      
      const { data, error } = await (supabase as any).from("masjids")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setError("Masjid not found.");
      } else {
        setMasjid(data);
      }
      setIsLoading(false);
    }
    fetchMasjid();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason for reporting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // We allow anonymous reports, but if session exists, we attach user_id
    const reporter_id = user ? user.id : null;

    const { error: submitError } = await (supabase as any).from("masjid_reports")
      .insert({
        masjid_id: params.id,
        reporter_id,
        reason,
        details,
      });

    if (submitError) {
      console.error(submitError);
      setError("Failed to submit report. Please try again.");
    } else {
      setSuccess(true);
    }
    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!masjid) {
    return (
      <div className="container mx-auto py-12 text-center text-red-500">
        {error || "Masjid not found."}
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto py-12 max-w-lg animate-fade-up">
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flag size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Report Submitted</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for helping keep our community safe. Our team will review your report regarding <strong>{masjid.name}</strong> as soon as possible.
          </p>
          <Link 
            href={`/masjids/${masjid.id}`}
            className="inline-flex items-center text-primary font-medium hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Masjid Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 max-w-xl">
      <div className="mb-6">
        <Link href={`/masjids/${masjid.id}`} className="text-sm text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {masjid.name}
        </Link>
      </div>

      <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center text-red-500 mb-4">
          <Flag className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Report Profile</h1>
        </div>
        
        <p className="text-muted-foreground mb-6">
          If you believe <strong>{masjid.name}</strong> is incorrectly verified, fraudulent, or posting inappropriate content, please let us know.
        </p>

        {error && (
          <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">Reason for reporting</label>
            <select
              id="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="" disabled>Select a reason</option>
              <option value="fraudulent">Fraudulent or Fake Profile</option>
              <option value="incorrectly_verified">Incorrectly Verified Faculty</option>
              <option value="obscene_content">Obscene or Inappropriate Content</option>
              <option value="spam">Spam / Scam Campaigns</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="details" className="text-sm font-medium">Additional Details (Optional)</label>
            <textarea
              id="details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide any additional context to help us investigate..."
              className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex justify-center items-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Report...
              </>
            ) : (
              "Submit Report"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
