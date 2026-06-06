"use client";

import React from "react";
import { SlidersHorizontal, CheckCircle } from "lucide-react";

interface DirectoryFiltersProps {
  radiusKm: number;
  setRadiusKm: (val: number) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (val: boolean) => void;
  targetDemographics: string[];
  setTargetDemographics: (val: string[]) => void;
}

export default function DirectoryFilters({
  radiusKm,
  setRadiusKm,
  verifiedOnly,
  setVerifiedOnly,
  targetDemographics,
  setTargetDemographics,
}: DirectoryFiltersProps) {
  
  const toggleDemographic = (demo: string) => {
    if (targetDemographics.includes(demo)) {
      setTargetDemographics(targetDemographics.filter(d => d !== demo));
    } else {
      setTargetDemographics([...targetDemographics, demo]);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap gap-4 items-center justify-between sticky top-[60px] z-10 shadow-sm">
      
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-slate-700">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium">Radius:</span>
          <select 
            className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
          >
            <option value={5}>Within 5 km</option>
            <option value={15}>Within 15 km</option>
            <option value={50}>Within 50 km</option>
            <option value={50000}>Country-wide</option>
          </select>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900">
            <input 
              type="checkbox" 
              className="accent-[#D4AF37] w-4 h-4"
              checked={targetDemographics.includes("Youth & Children")}
              onChange={() => toggleDemographic("Youth & Children")}
            />
            Youth & Children
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900">
            <input 
              type="checkbox" 
              className="accent-[#D4AF37] w-4 h-4"
              checked={targetDemographics.includes("Sisters/Women")}
              onChange={() => toggleDemographic("Sisters/Women")}
            />
            Sisters/Women
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900">
            <input 
              type="checkbox" 
              className="accent-[#D4AF37] w-4 h-4"
              checked={targetDemographics.includes("Families")}
              onChange={() => toggleDemographic("Families")}
            />
            Families
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors border ${
            verifiedOnly 
              ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#8C7320]" 
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {verifiedOnly && <CheckCircle className="w-3.5 h-3.5" />}
          Show Verified Only
        </button>
      </div>

    </div>
  );
}
