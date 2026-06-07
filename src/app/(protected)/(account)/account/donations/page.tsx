import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Heart, Building2, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Donations | Home Masjid",
};

export default async function AccountDonationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user donations
  // home_masjid.donations -> projects -> masjids
  const { data: donations } = await (supabase as any).from("donations")
    .select(`
      id,
      amount,
      payment_status,
      created_at,
      is_recurring,
      project_id,
      projects (
        title,
        masjid_id,
        masjids (
          id,
          name,
          city
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500" /> My Donations
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          View your donation history and recurring Sadaqah Jariyah.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        {(!donations || donations.length === 0) ? (
          <div className="p-8 text-center text-slate-500">
            You haven't made any donations yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {donations.map((d: any) => {
              const project = d.projects;
              const masjid = project?.masjids;
              return (
                <div key={d.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          d.payment_status === "completed" ? "bg-emerald-100 text-emerald-700" :
                          d.payment_status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {d.payment_status.toUpperCase()}
                        </span>
                        {d.is_recurring && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            RECURRING
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {project?.title || "Community Project"}
                      </h3>
                      {masjid && (
                        <Link href={`/masjids/${masjid.id}`} className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" /> {masjid.name}, {masjid.city}
                        </Link>
                      )}
                    </div>

                    <div className="flex flex-col md:items-end gap-1">
                      <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <DollarSign className="w-5 h-5 text-slate-400" />
                        {d.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(d.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
