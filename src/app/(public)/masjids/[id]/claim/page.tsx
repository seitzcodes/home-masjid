"use client";

import React, { useState } from "react";
import { submitClaim } from "./actions";
import { ShieldCheck, UploadCloud, AlertCircle } from "lucide-react";

export default function ClaimMasjidPage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append("masjidId", params.id);

    const result = await submitClaim(formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
    // If successful, the server action redirects automatically
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6 bg-slate-50 border-b border-slate-100 rounded-t-lg pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#0F172A] p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-2xl font-semibold leading-none tracking-tight text-[#0F172A]">Claim this Masjid</h3>
          </div>
          <p className="text-sm text-slate-500">
            Submit your details and verification documents to gain administrative access to this masjid profile.
          </p>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-6 pt-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="roleTitle" className="text-sm font-medium leading-none text-slate-900">Your Role at the Masjid</label>
              <input 
                id="roleTitle" 
                name="roleTitle" 
                placeholder="e.g. Imam, Board Member, Administrator" 
                required 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium leading-none text-slate-900">Contact Phone Number</label>
              <input 
                id="phoneNumber" 
                name="phoneNumber" 
                type="tel"
                placeholder="For verification calls" 
                required 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="document" className="text-sm font-medium leading-none text-slate-900">Verification Document</label>
              <p className="text-xs text-slate-500 mb-2">
                Please upload an official document (NPO certificate, signed board letter, or utility bill in the masjid's name).
              </p>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                <input 
                  id="document" 
                  name="document" 
                  type="file" 
                  accept=".pdf,image/*"
                  required 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-700">Click to upload document</span>
                <span className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 5MB</span>
              </div>
            </div>
          </div>
          <div className="flex items-center p-6 bg-slate-50 border-t border-slate-100 rounded-b-lg pt-6">
            <button 
              type="submit" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium py-2.5 h-auto transition-all disabled:pointer-events-none disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Claim..." : "Submit Verification Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
