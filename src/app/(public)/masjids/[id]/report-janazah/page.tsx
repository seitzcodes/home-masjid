import { createClient } from "@/lib/supabase/server";
import { submitJanazahNotice } from "./actions";
import { redirect } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function ReportJanazahPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/masjids/${params.id}/report-janazah`);
  }

  const { data: masjid } = await (supabase as any)
    .from("masjids")
    .select("name")
    .eq("id", params.id)
    .single();

  if (!masjid) return <div>Masjid not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link href={`/masjids/${params.id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {masjid.name}
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white text-center">
          <h1 className="text-2xl font-bold font-outfit mb-2">Report a Janazah</h1>
          <p className="text-slate-300 text-sm">
            Inna lillahi wa inna ilayhi raji'un. We belong to Allah and to Him we shall return.
          </p>
        </div>

        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3 text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>
              <strong>Important:</strong> Submitting this form will send a notice to the faculty of <strong>{masjid.name}</strong>. It will not be publicly broadcasted until an official approves it.
            </p>
          </div>

          <form action={async (formData) => {
            "use server";
            await submitJanazahNotice(params.id, formData);
          }} className="space-y-5">
            <div>
              <label htmlFor="deceased_name" className="block text-sm font-medium text-slate-700 mb-1">
                Name of the Deceased <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="deceased_name"
                name="deceased_name"
                required
                placeholder="e.g. Abdullah bin Muhammad"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="date_of_passing" className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Passing <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date_of_passing"
                  name="date_of_passing"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label htmlFor="janazah_time" className="block text-sm font-medium text-slate-700 mb-1">
                  Time of Janazah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="janazah_time"
                  name="janazah_time"
                  required
                  placeholder="e.g. After Dhuhr (13:30)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="burial_location" className="block text-sm font-medium text-slate-700 mb-1">
                Burial Location (Cemetery)
              </label>
              <input
                type="text"
                id="burial_location"
                name="burial_location"
                placeholder="e.g. Westpark Cemetery"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="e.g. Family residence for condolences: 123 Main St."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-md hover:bg-slate-800 transition-colors"
            >
              Submit Notice
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
