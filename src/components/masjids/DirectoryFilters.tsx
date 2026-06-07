"use client";

import React, { useState } from "react";
import { SlidersHorizontal, CheckCircle, Navigation, MapIcon, List, Filter, X } from "lucide-react";

interface DirectoryFiltersProps {
  radiusKm: number;
  setRadiusKm: (val: number) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (val: boolean) => void;
  facilitiesFilter: string[];
  setFacilitiesFilter: (val: string[]) => void;
  onRequestLocation: () => void;
  hasLocation: boolean;
  viewMode: "map" | "list";
  setViewMode: (val: "map" | "list") => void;
}

export default function DirectoryFilters({
  radiusKm,
  setRadiusKm,
  verifiedOnly,
  setVerifiedOnly,
  facilitiesFilter,
  setFacilitiesFilter,
  onRequestLocation,
  hasLocation,
  viewMode,
  setViewMode
}: DirectoryFiltersProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const toggleFacility = (facility: string) => {
    if (facilitiesFilter.includes(facility)) {
      setFacilitiesFilter(facilitiesFilter.filter(f => f !== facility));
    } else {
      setFacilitiesFilter([...facilitiesFilter, facility]);
    }
  };

  const activeFiltersCount = (verifiedOnly ? 1 : 0) + facilitiesFilter.length + (radiusKm !== 50000 ? 1 : 0);

  return (
    <>
      <div className="bg-white border-b border-slate-200 sticky top-[60px] z-10 shadow-sm">
        
        {/* DESKTOP VIEW */}
        <div className="hidden md:flex px-4 py-3 flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <button 
              onClick={onRequestLocation}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${hasLocation ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <Navigation className="w-4 h-4" />
              {hasLocation ? "Location Active" : "Find Near Me"}
            </button>

            <div className="flex items-center gap-2 text-slate-700">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">Radius:</span>
              <select 
                className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                disabled={!hasLocation}
              >
                <option value={5}>Within 5 km</option>
                <option value={15}>Within 15 km</option>
                <option value={50}>Within 50 km</option>
                <option value={50000}>Country-wide</option>
              </select>
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900">
                <input 
                  type="checkbox" 
                  className="accent-[#D4AF37] w-4 h-4"
                  checked={facilitiesFilter.includes("youth_center")}
                  onChange={() => toggleFacility("youth_center")}
                />
                Youth Center
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900">
                <input 
                  type="checkbox" 
                  className="accent-[#D4AF37] w-4 h-4"
                  checked={facilitiesFilter.includes("wudu_area_ladies")}
                  onChange={() => toggleFacility("wudu_area_ladies")}
                />
                Ladies Wudu Area
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900">
                <input 
                  type="checkbox" 
                  className="accent-[#D4AF37] w-4 h-4"
                  checked={facilitiesFilter.includes("wheelchair_accessible")}
                  onChange={() => toggleFacility("wheelchair_accessible")}
                />
                Wheelchair Accessible
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

        {/* MOBILE VIEW */}
        <div className="md:hidden px-4 py-2 flex items-center justify-between gap-3">
          <button 
            onClick={onRequestLocation}
            className={`flex items-center justify-center p-2.5 rounded-lg border transition-colors ${hasLocation ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            <Navigation className="w-4 h-4" />
          </button>

          <div className="bg-slate-100 p-1 rounded-lg flex flex-1">
            <button 
              onClick={() => setViewMode("list")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button 
              onClick={() => setViewMode("map")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "map" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Map
            </button>
          </div>

          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${activeFiltersCount > 0 ? 'bg-[#D4AF37]/10 text-[#8C7320] border-[#D4AF37]/20' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            <Filter className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && <span className="bg-[#D4AF37] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ml-0.5">{activeFiltersCount}</span>}
          </button>
        </div>
      </div>

      {/* MOBILE FILTERS OVERLAY */}
      {isMobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom-full duration-200">
          <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-slate-500 hover:text-slate-900 bg-slate-200/50 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            {/* Radius Section */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Search Radius
              </h3>
              <select 
                className="w-full text-base border border-slate-200 rounded-xl p-3.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:bg-slate-50"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                disabled={!hasLocation}
              >
                <option value={5}>Within 5 km</option>
                <option value={15}>Within 15 km</option>
                <option value={50}>Within 50 km</option>
                <option value={50000}>Country-wide</option>
              </select>
              {!hasLocation ? (
                <div className="mt-3 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-2">
                  <Navigation className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>You must enable location services to filter by radius.</p>
                </div>
              ) : null}
            </div>

            {/* Verification Section */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Verification</h3>
              <button 
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors border ${
                  verifiedOnly 
                    ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#8C7320]" 
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <span className="font-semibold">Show Verified Masjids Only</span>
                {verifiedOnly && <CheckCircle className="w-5 h-5" />}
              </button>
            </div>

            {/* Facilities Section */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Facilities</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-white active:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="accent-[#D4AF37] w-5 h-5"
                    checked={facilitiesFilter.includes("youth_center")}
                    onChange={() => toggleFacility("youth_center")}
                  />
                  <span className="text-base text-slate-700 font-medium">Youth Center</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-white active:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="accent-[#D4AF37] w-5 h-5"
                    checked={facilitiesFilter.includes("wudu_area_ladies")}
                    onChange={() => toggleFacility("wudu_area_ladies")}
                  />
                  <span className="text-base text-slate-700 font-medium">Ladies Wudu Area</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-white active:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="accent-[#D4AF37] w-5 h-5"
                    checked={facilitiesFilter.includes("wheelchair_accessible")}
                    onChange={() => toggleFacility("wheelchair_accessible")}
                  />
                  <span className="text-base text-slate-700 font-medium">Wheelchair Accessible</span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <button 
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-semibold shadow-sm transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}
