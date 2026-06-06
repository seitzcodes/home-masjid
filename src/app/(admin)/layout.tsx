import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Check if user is superadmin
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_superadmin")
    .eq("id", session.user.id)
    .single();

  if (!profile || !profile.is_superadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-600">
            You do not have the required permissions to view the Platform Administration dashboard.
          </p>
          <div className="pt-4">
            <Link href="/dashboard" className="text-sm font-medium text-[#D4AF37] hover:underline">
              Return to your Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-[#0F172A] text-white py-4 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="font-semibold text-lg">Platform Admin</h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/admin/claims" className="text-[#D4AF37]">
              Claims Queue
            </Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              Exit Admin
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {children}
      </main>
    </div>
  );
}
