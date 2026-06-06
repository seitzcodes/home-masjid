"use client";

import React from "react";
import Link from "next/link";
import { MapPin, CheckCircle, Navigation } from "lucide-react";

interface MasjidPreviewCardProps {
  id: string;
  name: string;
  city: string;
  address: string;
  distance_meters?: number;
  is_verified: boolean;
  onSetHome?: (id: string) => void;
}

export default function MasjidPreviewCard({
  id,
  name,
  city,
  address,
  distance_meters,
  is_verified,
  onSetHome,
}: MasjidPreviewCardProps) {
  // Format distance
  const distance = distance_meters 
    ? (distance_meters / 1000).toFixed(1) + " km away"
    : "Distance unknown";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
            {name}
            {is_verified && (
              <CheckCircle className="w-4 h-4 text-[#D4AF37]" aria-label="Verified Masjid" />
            )}
          </h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {address ? `${address}, ` : ""}{city}
          </p>
        </div>
      </div>

      {/* Live Prayer Widget (Mock) */}
      <div className="flex justify-between items-center bg-slate-50 rounded-lg p-2 mb-4 border border-slate-100 text-xs">
        <div className="text-center px-2">
          <p className="text-slate-400 font-medium">Fajr</p>
          <p className="text-slate-700">05:30</p>
        </div>
        <div className="text-center px-2">
          <p className="text-slate-400 font-medium">Dhuhr</p>
          <p className="text-slate-700">12:15</p>
        </div>
        <div className="text-center px-2 bg-[#D4AF37]/10 rounded border border-[#D4AF37]/30">
          <p className="text-[#D4AF37] font-semibold">Asr</p>
          <p className="text-[#0F172A] font-medium">15:45</p>
        </div>
        <div className="text-center px-2">
          <p className="text-slate-400 font-medium">Maghrib</p>
          <p className="text-slate-700">17:50</p>
        </div>
        <div className="text-center px-2">
          <p className="text-slate-400 font-medium">Isha</p>
          <p className="text-slate-700">19:10</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-slate-500 flex items-center gap-1 font-medium bg-slate-100 px-2 py-1 rounded-md">
          <Navigation className="w-3 h-3" />
          {distance}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onSetHome?.(id)}
            className="text-xs px-3 py-1.5 border border-slate-200 text-slate-600 rounded-md hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
          >
            Set Home
          </button>
          <Link
            href={`/masjids/${id}`}
            className="text-xs px-3 py-1.5 bg-[#0F172A] text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
