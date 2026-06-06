"use client";

import React, { useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import 'mapbox-gl/dist/mapbox-gl.css';
import { createClient } from "@/lib/supabase/client";
import { createFacility } from "./actions";
import { MapPin, AlertCircle, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { parsePostGisPoint } from "@/lib/utils/postgis";

export default function NewFacilityPage() {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState<{lat: number, lon: number} | null>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: 28.0473,
    latitude: -26.2041,
    zoom: 12
  });

  const supabase = createClient();

  const handleMapClick = (e: any) => {
    if (step !== 1) return;
    setPin({ lat: e.lngLat.lat, lon: e.lngLat.lng });
  };

  const checkDuplicates = async () => {
    if (!pin) return;
    setLoading(true);
    // Check 500 meter radius
    const { data, error } = await (supabase as any).rpc("get_nearest_masjids", {
      user_lat: pin.lat,
      user_lng: pin.lon,
      max_distance_meters: 500
    });
    
    setLoading(false);
    
    if (data && data.length > 0) {
      setDuplicates(data);
      setStep(2); // Show duplicates
    } else {
      setStep(3); // Proceed to form
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#0F172A] p-6 text-white text-center">
            <h1 className="text-2xl font-bold font-outfit">Add a Missing Facility</h1>
            <p className="text-slate-300 mt-2 text-sm max-w-lg mx-auto">
              Help us map the global community. Added facilities remain unverified until proof documents are submitted by faculty.
            </p>
          </div>

          <div className="p-6 md:p-8">
            
            {/* STEP 1: Map Pin */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#0F172A]">
                  <div className="bg-[#D4AF37] w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                  <h2 className="text-xl font-bold font-outfit">Drop a Pin</h2>
                </div>
                <p className="text-slate-600">Click on the map to pinpoint the exact location of the prayer facility.</p>
                
                <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200">
                  <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onClick={handleMapClick}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY2x4bHp6ZXIzMHZ0djJrcHJwNm1rN2pqciJ9.placeholder"}
                    cursor="crosshair"
                  >
                    {pin && (
                      <Marker longitude={pin.lon} latitude={pin.lat} anchor="bottom">
                        <MapPin className="text-[#DC2626] w-8 h-8 -mt-8" fill="currentColor" />
                      </Marker>
                    )}
                  </Map>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={checkDuplicates}
                    disabled={!pin || loading}
                    className="bg-[#0F172A] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? "Checking location..." : "Next Step"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Duplicate Check */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-amber-900">We found facilities near this location!</h3>
                    <p className="text-amber-800 text-sm mt-1">
                      To prevent duplicate entries, please check if the facility you are trying to add is already listed below.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {duplicates.map((masjid) => (
                    <div key={masjid.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center bg-white hover:border-[#D4AF37] transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          {masjid.name}
                          {masjid.is_verified && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </h4>
                        <p className="text-sm text-slate-500">{masjid.city}, {masjid.country}</p>
                      </div>
                      <Link href={`/masjids/${masjid.id}`} className="text-sm font-medium text-[#0F172A] hover:underline bg-slate-100 px-4 py-2 rounded-md">
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button onClick={() => setStep(1)} className="text-slate-500 font-medium hover:text-slate-800">
                    Go Back
                  </button>
                  <button onClick={() => setStep(3)} className="bg-[#0F172A] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800">
                    None of these. Continue creating new.
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Details Form */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#0F172A]">
                  <div className="bg-[#D4AF37] w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                  <h2 className="text-xl font-bold font-outfit">Facility Details</h2>
                </div>

                <form action={createFacility as any} className="space-y-5">
                  <input type="hidden" name="lat" value={pin?.lat} />
                  <input type="hidden" name="lon" value={pin?.lon} />
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Facility Name *</label>
                    <input required type="text" name="name" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none" placeholder="e.g. Westside Community Mosque" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                      <input required type="text" name="city" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none" placeholder="City" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Country *</label>
                      <input required type="text" name="country" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none" placeholder="Country" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                    <input type="text" name="address" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none" placeholder="123 Main St" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Facility Type</label>
                    <select name="facilityType" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D4AF37] outline-none bg-white">
                      <option value="jumuah_masjid">Jumuah Masjid (Hosts 5 daily prayers + Friday prayers)</option>
                      <option value="daily_masjid">Daily Masjid (Hosts 5 daily prayers only)</option>
                      <option value="public_musalla">Public Musalla (Malls, Airports, Universities)</option>
                      <option value="private_facility">Private Facility (Workplace, Gated Community, Jamaat Khana)</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="radio" name="isPublic" value="true" defaultChecked className="mt-1" />
                      <div>
                        <p className="font-medium text-slate-900">List Publicly in Directory</p>
                        <p className="text-sm text-slate-500">Anyone can find this facility on the map.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer mt-4">
                      <input type="radio" name="isPublic" value="false" className="mt-1" />
                      <div>
                        <p className="font-medium text-slate-900">Keep Private (Hidden)</p>
                        <p className="text-sm text-slate-500">Will not appear on public map searches. Ideal for workplaces or private homes. Only accessible via secure invite link.</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setStep(1)} className="text-slate-500 font-medium hover:text-slate-800">
                      Start Over
                    </button>
                    <button type="submit" className="bg-[#0F172A] text-[#D4AF37] px-8 py-3 rounded-lg font-bold hover:bg-slate-800 shadow-md">
                      Submit Facility
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
