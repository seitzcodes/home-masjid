"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, ArrowLeft, Loader2, Info } from "lucide-react";
import Link from "next/link";

export default function ClaimMasjidPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [masjid, setMasjid] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [roleTitle, setRoleTitle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    async function fetchMasjid() {
      const supabase = createClient();
      
      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?redirect=/masjids/${params.id}/claim`);
        return;
      }

      // Fetch masjid
        const { data, error } = await (supabase.from("masjids") as any)
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
  }, [params.id, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!roleTitle.trim()) {
      setError("Please specify your role.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setError("You must be logged in.");
      setIsSubmitting(false);
      return;
    }

    const { error: submitError } = await (supabase.from("masjid_claims") as any)
      .insert({
        masjid_id: params.id,
        user_id: session.user.id,
        role_title: roleTitle,
        phone_number: phoneNumber,
      });

    if (submitError) {
      console.error(submitError);
      // Handle RLS or unique constraint errors if any
      setError("Failed to submit claim. You may have already submitted a claim for this masjid.");
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
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Claim Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Your request to claim <strong>{masjid.name}</strong> has been submitted. Our team will review it shortly.
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
        <h1 className="text-2xl font-bold mb-2">Claim Masjid</h1>
        <p className="text-muted-foreground mb-6">
          Submit a request to verify and manage the profile for <strong>{masjid.name}</strong>.
        </p>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex items-start text-sm">
          <Info className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
          <p>
            By claiming this masjid, you confirm that you are an official representative (e.g. Imam, Committee Member, Administrator) and have the authority to post updates and manage programs on its behalf.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="roleTitle" className="text-sm font-medium">Your Official Role</label>
            <input
              id="roleTitle"
              type="text"
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Imam, Committee Chairman, Admin"
              className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="For verification purposes"
              className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary-light transition-colors flex justify-center items-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Submit Verification Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
