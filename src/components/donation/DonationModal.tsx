"use client";

import React, { useState } from "react";
import { initiateDonation } from "@/app/(public)/masjids/[id]/actions";
import { X, Heart, AlertCircle } from "lucide-react";

export function DonationModal({
  isOpen,
  onClose,
  projectId,
  masjidId,
  projectTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  masjidId: string;
  projectTitle: string;
}) {
  const [amount, setAmount] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const presetAmounts = [100, 250, 500, 1000];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const finalAmount = customAmount ? parseInt(customAmount, 10) : amount;
    if (isNaN(finalAmount) || finalAmount < 10) {
      setError("Please enter a valid amount of at least R10.");
      setIsSubmitting(false);
      return;
    }
    if (!email) {
      setError("Please provide an email address for your receipt.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("masjidId", masjidId);
    formData.append("amount", finalAmount.toString());
    formData.append("email", email);

    const result = await initiateDonation(formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
    // If successful, the server action redirects to Paystack
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#D4AF37]/10 rounded-full">
              <Heart className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">Support Project</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Donating to:</p>
          <p className="text-[#0F172A] font-semibold text-lg mb-6">{projectTitle}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Select Amount (ZAR)</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount("");
                    }}
                    className={`py-3 rounded-xl border text-base font-semibold transition-all ${
                      amount === preset && !customAmount
                        ? "border-[#D4AF37] bg-[#D4AF37]/5 text-[#0F172A] ring-1 ring-[#D4AF37]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    R {preset}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R</span>
                <input
                  type="number"
                  placeholder="Custom Amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount(0);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="donor-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="donor-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="For your receipt"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-medium text-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Initializing Secure Payment...</span>
              ) : (
                <>
                  Proceed to Payment
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
            <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
              <span className="inline-block w-3 h-4 bg-[url('https://upload.wikimedia.org/wikipedia/commons/1/1f/Paystack_Logo.png')] bg-contain bg-no-repeat opacity-50" />
              Secured by Paystack
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
