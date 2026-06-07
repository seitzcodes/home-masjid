"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import DirectoryFilters from "@/components/masjids/DirectoryFilters";
import MasjidPreviewCard from "@/components/masjids/MasjidPreviewCard";
import MasjidMap from "@/components/masjids/MasjidMap";
import { MapIcon, List } from "lucide-react";

interface DirectoryClientLayoutProps {
  initialMasjids: any[];
}

export default function DirectoryClientLayout({ initialMasjids }: DirectoryClientLayoutProps) {
  const [masjids, setMasjids] = useState(initialMasjids);
  const [radiusKm, setRadiusKm] = useState(50000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [targetDemographics, setTargetDemographics] = useState<string[]>([]);
  const [facilitiesFilter, setFacilitiesFilter] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [loading, setLoading] = useState(true);
  const [homeMasjidId, setHomeMasjidId] = useState<string | null>(null);
  const [nextPrograms, setNextPrograms] = useState<Record<string, string>>({});

  const supabase = createClient();
  const handleRequestLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
          alert("Could not get your location. Please check browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    async function fetchLocalMasjids() {
      if (!userLocation && radiusKm < 50000) return; // Need location for radius search

      setLoading(true);

      if (userLocation) {
        // Call RPC
        const { data, error } = await (supabase as any).rpc("get_nearest_masjids", {
          user_lat: userLocation.latitude,
          user_lng: userLocation.longitude,
          max_distance_meters: radiusKm * 1000,
        });

        if (!error && data) {
          let filtered = data;
          if (verifiedOnly) {
            filtered = filtered.filter((m: any) => m.is_verified);
          }
          // Note: Facility filtering would ideally happen in the RPC or via a Postgres JSONB query.
          // Since we are filtering locally for now on a small dataset:
          if (facilitiesFilter.length > 0) {
            filtered = filtered.filter((m: any) => {
              if (!m.facilities) return false;
              return facilitiesFilter.every(f => m.facilities[f] === true);
            });
          }
          setMasjids(filtered);
        } else {
          console.error("Error fetching nearby masjids:", error);
        }
      } else {
        // Fallback: standard query if no location permission
        let query = (supabase as any).from("masjids").select("*");
        if (verifiedOnly) query = query.eq("is_verified", true);
        
        // JSONB query for facilities
        if (facilitiesFilter.length > 0) {
          facilitiesFilter.forEach(f => {
            query = query.contains('facilities', { [f]: true });
          });
        }
        
        const { data } = await query;
        if (data) setMasjids(data);
      }

      setLoading(false);
    }

    async function fetchUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await (supabase as any)
          .from("user_profiles")
          .select("home_masjid_id")
          .eq("id", user.id)
          .single();
        if (profile?.home_masjid_id) setHomeMasjidId(profile.home_masjid_id);
      }
    }

    fetchLocalMasjids();
    fetchUserProfile();
  }, [userLocation, radiusKm, verifiedOnly, facilitiesFilter, supabase]);

  // Fetch next programs for the current masjids
  useEffect(() => {
    async function fetchNextPrograms() {
      if (masjids.length === 0) return;
      
      const masjidIds = masjids.map((m: any) => m.id);
      const now = new Date().toISOString();
      
      const { data, error } = await (supabase as any).from('programs')
        .select('masjid_id, title, start_time')
        .in('masjid_id', masjidIds)
        .gte('start_time', now)
        .order('start_time', { ascending: true });
        
      if (!error && data) {
        const nextMap: Record<string, string> = {};
        // Because of the order, we only take the first one we see per masjid
        for (const prog of data) {
          if (!nextMap[prog.masjid_id!]) {
            const timeStr = new Date(prog.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            nextMap[prog.masjid_id!] = `${prog.title} - ${timeStr}`;
          }
        }
        setNextPrograms(nextMap);
      }
    }
    
    fetchNextPrograms();
  }, [masjids, supabase]);

  const handleSetHome = (id: string) => {
    console.log("Setting home masjid:", id);
    // Future: Save to user profile
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      <DirectoryFilters
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
        facilitiesFilter={facilitiesFilter}
        setFacilitiesFilter={setFacilitiesFilter}
        onRequestLocation={handleRequestLocation}
        hasLocation={!!userLocation}
      />

      {/* Mobile Toggle */}
      <div className="md:hidden p-3 bg-white border-b border-slate-200 flex justify-center">
        <div className="bg-slate-100 p-1 rounded-lg flex w-full max-w-xs">
          <button 
            onClick={() => setViewMode("list")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button 
            onClick={() => setViewMode("map")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "map" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            <MapIcon className="w-4 h-4" /> Map
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Map Side (Left on Desktop) */}
        <div className={`flex-1 md:block ${viewMode === "map" ? "block" : "hidden"} relative`}>
          <MasjidMap masjids={masjids} userLocation={userLocation} nextPrograms={nextPrograms} />
        </div>

        {/* List Side (Right on Desktop) */}
        <div className={`w-full md:w-[450px] lg:w-[500px] bg-slate-50 border-l border-slate-200 overflow-y-auto ${viewMode === "list" ? "block" : "hidden"} md:block`}>
          <div className="p-4 space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              {loading ? "Locating..." : `${masjids.length} Masjids Found`}
            </h2>
            
            {masjids.map(masjid => (
                <MasjidPreviewCard 
                key={masjid.id} 
                {...masjid} 
                nextProgramTitle={nextPrograms[masjid.id]}
                isHome={homeMasjidId === masjid.id}
              />
            ))}

            {masjids.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-slate-500">No masjids found in this area.</p>
                <button 
                  onClick={() => setRadiusKm(50000)}
                  className="mt-4 text-[#D4AF37] font-medium hover:underline"
                >
                  Expand search radius
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
