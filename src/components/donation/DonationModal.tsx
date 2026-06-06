"use client";

import React, { useState } from "react";
import { initiateDonation } from "@/app/(public)/masjids/[id]/actions";
import { X, Heart, AlertCircle, RefreshCw, EyeOff } from "lucide-react";

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
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const presetAmounts = [100, 250, 500, 1000];
  const finalAmount = customAmount ? parseInt(customAmount, 10) : amount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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
    formData.append("isRecurring", isRecurring.toString());
    formData.append("isAnonymous", isAnonymous.toString());

    const result = await initiateDonation(formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
    // On success the server action redirects to Paystack
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#0F172A]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#D4AF37]/10 rounded-full">
              <Heart className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Support Project</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{projectTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* One-time vs Monthly toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                id="donation-onetime"
                onClick={() => setIsRecurring(false)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  !isRecurring
                    ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                Give Once
              </button>
              <button
                type="button"
                id="donation-recurring"
                onClick={() => setIsRecurring(true)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  isRecurring
                    ? "bg-[#D4AF37] text-[#0F172A] shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Monthly Sadaqah
              </button>
            </div>

            {isRecurring && (
              <div className="flex items-start gap-2 p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
                <RefreshCw className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <p className="text-xs text-[#92750A] dark:text-[#D4AF37] leading-relaxed">
                  <strong>Sadaqah Jariyah</strong> — your R{isNaN(finalAmount) ? "?" : finalAmount} gift will renew automatically each month.
                  You will receive a receipt for every payment.
                </p>
              </div>
            )}

            {/* Amount selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Select Amount (ZAR)
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => { setAmount(preset); setCustomAmount(""); }}
                    className={`py-3 rounded-xl border text-base font-semibold transition-all ${
                      amount === preset && !customAmount
                        ? "border-[#D4AF37] bg-[#D4AF37]/5 text-[#0F172A] dark:text-white ring-1 ring-[#D4AF37]"
                        : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
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
                  id="donation-custom-amount"
                  placeholder="Custom Amount"
                  value={customAmount}
                  min={10}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="donor-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                id="donor-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="For your receipt"
                required
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              />
            </div>

            {/* Anonymous toggle */}
            <label
              htmlFor="donation-anonymous"
              className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <input
                id="donation-anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Donate Anonymously</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Your name will appear as "Anonymous" on the masjid page</p>
                </div>
              </div>
            </label>

            {/* Submit */}
            <button
              id="donation-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-semibold text-base transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Initializing Secure Payment…
                </span>
              ) : (
                <>
                  {isRecurring ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Start Monthly Sadaqah — R{isNaN(finalAmount) ? "?" : finalAmount}/mo
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              Secured by Paystack · Encrypted & PCI-DSS compliant
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
