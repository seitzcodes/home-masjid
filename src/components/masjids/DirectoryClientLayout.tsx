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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map"); // Mobile view toggle
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    async function fetchLocalMasjids() {
      if (!userLocation && radiusKm < 50000) return; // Need location for radius search

      setLoading(true);

      if (userLocation) {
        // Call RPC
        const { data, error } = await supabase.rpc("get_nearby_masjids", {
          user_lat: userLocation.latitude,
          user_lng: userLocation.longitude,
          radius_meters: radiusKm * 1000,
        });

        if (!error && data) {
          let filtered = data;
          if (verifiedOnly) {
            filtered = filtered.filter((m: any) => m.is_verified);
          }
          setMasjids(filtered);
        } else {
          console.error("Error fetching nearby masjids:", error);
        }
      } else {
        // Fallback: standard query if no location permission
        let query = supabase.from("masjids").select("*");
        if (verifiedOnly) query = query.eq("is_verified", true);
        
        const { data } = await query;
        if (data) setMasjids(data);
      }

      setLoading(false);
    }

    fetchLocalMasjids();
  }, [userLocation, radiusKm, verifiedOnly, supabase]);

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
        targetDemographics={targetDemographics}
        setTargetDemographics={setTargetDemographics}
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
          <MasjidMap masjids={masjids} userLocation={userLocation} />
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
                onSetHome={handleSetHome}
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
