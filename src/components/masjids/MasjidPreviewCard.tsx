"use client";

import React from "react";
import Link from "next/link";
import { MapPin, CheckCircle, Navigation, Clock } from "lucide-react";
import { PrayerTimes, Coordinates, CalculationMethod } from "adhan";
import { parsePostGisPoint } from "@/lib/utils/postgis";
import { SetHomeMasjidButton } from "@/components/masjids/SetHomeMasjidButton";

interface MasjidPreviewCardProps {
  id: string;
  name: string;
  city: string;
  address: string;
  distance_meters?: number;
  is_verified: boolean;
  gps_location?: string;
  timezone?: string;
  nextProgramTitle?: string;
  isHome?: boolean;
}

export default function MasjidPreviewCard({
  id,
  name,
  city,
  address,
  distance_meters,
  is_verified,
  gps_location,
  timezone,
  nextProgramTitle,
  isHome = false,
}: MasjidPreviewCardProps) {
  // Format distance
  const distance = distance_meters 
    ? (distance_meters / 1000).toFixed(1) + " km away"
    : "Distance unknown";

  // Calculate Prayer Times
  let prayerTimesObj = null;
  if (gps_location) {
    const coords = parsePostGisPoint(gps_location);
    if (coords) {
      const coordinates = new Coordinates(coords.lat, coords.lng);
      const params = CalculationMethod.MuslimWorldLeague();
      const date = new Date();
      prayerTimesObj = new PrayerTimes(coordinates, date, params);
    }
  }

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    };
    if (timezone) {
      options.timeZone = timezone;
    }
    return date.toLocaleTimeString([], options);
  };

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

      {/* Live Prayer Widget */}
      {prayerTimesObj ? (
        <div className="flex justify-between items-center bg-slate-50 rounded-lg p-2 mb-4 border border-slate-100 text-xs">
          <div className="text-center px-2">
            <p className="text-slate-400 font-medium">Fajr</p>
            <p className="text-slate-700">{formatTime(prayerTimesObj.fajr)}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-slate-400 font-medium">Dhuhr</p>
            <p className="text-slate-700">{formatTime(prayerTimesObj.dhuhr)}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-slate-400 font-medium">Asr</p>
            <p className="text-slate-700">{formatTime(prayerTimesObj.asr)}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-slate-400 font-medium">Maghrib</p>
            <p className="text-slate-700">{formatTime(prayerTimesObj.maghrib)}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-slate-400 font-medium">Isha</p>
            <p className="text-slate-700">{formatTime(prayerTimesObj.isha)}</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100 text-xs text-center text-slate-500">
          Prayer times unavailable
        </div>
      )}

      {nextProgramTitle && (
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-md p-2 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          <p className="text-xs text-[#0F172A] font-medium">Next: {nextProgramTitle}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-slate-500 flex items-center gap-1 font-medium bg-slate-100 px-2 py-1 rounded-md">
          <Navigation className="w-3 h-3" />
          {distance}
        </div>
        
        <div className="flex gap-2">
          <SetHomeMasjidButton masjidId={id} isHome={isHome} className="text-xs py-1.5" />
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
