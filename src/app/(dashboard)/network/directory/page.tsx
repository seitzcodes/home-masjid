import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Building2, Search, MapPin, CheckCircle, Network } from "lucide-react";
import { sendConnectionRequest } from "../actions";

export default async function NetworkDirectoryPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;

  // 1. Get the current user's faculty masjids to know who they are representing
  const { data: facultyRoles } = await (supabase as any).from("masjid_faculty")
    .select("masjid_id")
    .eq("user_id", session.user.id);

  const myMasjidIds = facultyRoles?.map((r: any) => r.masjid_id) || [];

  // 2. Fetch all verified masjids (excluding the ones the user manages)
  let query = supabase
    .from("masjids")
    .select("id, name, city, country, is_verified")
    .eq("is_verified", true);
  
  if (myMasjidIds.length > 0) {
    query = query.not("id", "in", `(${myMasjidIds.join(',')})`);
  }

  const { data: verifiedMasjids, error } = await query;

  // 3. Fetch existing connections for the user's masjids
  const { data: connectionsData } = await (supabase as any).from("masjid_connections")
    .select("*")
    .or(`requester_masjid_id.in.(${myMasjidIds.join(',')}),receiver_masjid_id.in.(${myMasjidIds.join(',')})`);
  const connections = connectionsData as any[] | null;

  const connectionStatusMap: Record<string, string> = {};
  connections?.forEach(conn => {
    // Determine the "other" masjid id
    const otherId = myMasjidIds.includes(conn.requester_masjid_id) 
      ? conn.receiver_masjid_id 
      : conn.requester_masjid_id;
    connectionStatusMap[otherId] = conn.status;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Collaboration Directory</h1>
        <p className="text-slate-500">Discover and connect with other verified Masjids globally.</p>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, city, or country..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {verifiedMasjids?.map((masjid) => {
          const status = connectionStatusMap[masjid.id];
          
          return (
            <div key={masjid.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 leading-tight">{masjid.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>{masjid.city}, {masjid.country}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                {status === "accepted" ? (
                  <button disabled className="w-full py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200 flex items-center justify-center gap-2">
                    <Network className="w-4 h-4" /> Connected
                  </button>
                ) : status === "pending" ? (
                  <button disabled className="w-full py-2 bg-slate-50 text-slate-500 rounded-lg text-sm font-medium border border-slate-200">
                    Request Pending
                  </button>
                ) : (
                  <form action={async () => {
                    "use server";
                    if (myMasjidIds.length > 0) {
                      await sendConnectionRequest(myMasjidIds[0], masjid.id);
                    }
                  }}>
                    <button className="w-full py-2 bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Network className="w-4 h-4" /> Connect
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
