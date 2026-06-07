import { AlertCircle, Clock, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function JanazahBanner({ masjidId }: { masjidId: string }) {
  const supabase = await createClient();
  
  // Fetch approved janazahs that haven't expired (within last 24 hours of creation, or date_of_passing is very recent)
  // For simplicity, let's fetch any approved janazah where created_at is within the last 48 hours
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  
  const { data: activeJanazahs } = await (supabase as any).from("janazahs")
    .select("*")
    .eq("masjid_id", masjidId)
    .eq("status", "approved")
    .gte("created_at", twoDaysAgo)
    .order("created_at", { ascending: false });

  if (!activeJanazahs || activeJanazahs.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {activeJanazahs.map((janazah: any) => (
        <div 
          key={janazah.id} 
          className="bg-slate-900 border-l-4 border-slate-600 rounded-r-xl shadow-md p-5 text-white animate-fade-in"
        >
          <div className="flex items-start gap-3">
            <div className="bg-slate-800 p-2 rounded-full shrink-0 mt-1">
              <AlertCircle className="w-5 h-5 text-slate-300" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold font-outfit text-white">
                  Janazah: {janazah.deceased_name}
                </h3>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded font-medium inline-block w-max">
                  {new Date(janazah.date_of_passing).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-slate-300 text-sm mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Time: <strong className="text-white">{janazah.janazah_time}</strong></span>
                </div>
                {janazah.burial_location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Burial: <strong className="text-white">{janazah.burial_location}</strong></span>
                  </div>
                )}
              </div>
              
              {janazah.notes && (
                <p className="text-slate-400 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  "{janazah.notes}"
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
