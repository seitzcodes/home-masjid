import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MapPin, Users, CheckCircle, Navigation } from "lucide-react";
import ProfileTabs from "@/components/masjids/ProfileTabs";

// Need to ensure the params are handled correctly for Next.js 15+ async params if applicable, 
// but using standard props for now.
interface Props {
  params: {
    id: string;
  };
}

export default async function MasjidProfilePage({ params }: Props) {
  const supabase = await createClient();
  const masjidId = params.id;

  // The user instructed us to fetch related data (programs, projects) 
  // Make sure these tables exist, if they don't the query will fail.
  // We'll use a safe query first, and try to get relationships if available.
  const { data: masjid, error } = await supabase
    .from("masjids")
    .select(`
      id,
      name,
      address,
      city,
      country,
      is_verified,
      gps_location
    `)
    .eq("id", masjidId)
    .single();

  if (error || !masjid) {
    notFound();
  }

  // Safely fetch programs and projects separately in case relations aren't built
  const { data: programs } = await supabase
    .from("programs")
    .select("*")
    .eq("masjid_id", masjidId);

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("masjid_id", masjidId);

  // Parse location to pass to map
  let lat = null, lon = null;
  if (masjid.gps_location) {
    if (typeof masjid.gps_location === 'string') {
      const match = masjid.gps_location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
      if (match) {
        lon = parseFloat(match[1]);
        lat = parseFloat(match[2]);
      }
    } else if (masjid.gps_location.coordinates) {
      lon = masjid.gps_location.coordinates[0];
      lat = masjid.gps_location.coordinates[1];
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-[#0F172A] text-white pt-20 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold flex items-center gap-3">
                {masjid.name}
                {masjid.is_verified && (
                  <span className="flex items-center gap-1 text-sm bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full font-medium border border-[#D4AF37]/30 align-middle mt-2">
                    <CheckCircle className="w-4 h-4" /> Verified
                  </span>
                )}
              </h1>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{masjid.address ? `${masjid.address}, ` : ''}{masjid.city}, {masjid.country}</span>
                </div>
                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>245 Followers</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Desktop */}
            <div className="hidden md:flex gap-3">
              <button className="px-5 py-2.5 bg-white text-[#0F172A] rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                Follow Updates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip (Mobile + Desktop) */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex gap-3 overflow-x-auto hide-scrollbar">
          <button className="flex-1 md:flex-none whitespace-nowrap px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-lg font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Set as Home Masjid
          </button>
          <button className="flex-1 md:hidden whitespace-nowrap px-4 py-2 bg-[#0F172A] text-white rounded-lg font-medium">
            Follow Updates
          </button>
          {lat && lon && (
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <Navigation className="w-4 h-4" /> Directions
            </a>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 mt-2">
        <ProfileTabs 
          masjidId={masjidId} 
          programs={programs || []} 
          projects={projects || []} 
        />
      </main>
    </div>
  );
}
