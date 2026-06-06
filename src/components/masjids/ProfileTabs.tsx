"use client";

import React, { useState } from "react";
import RealtimePostFeed from "./RealtimePostFeed";
import { DonationModal } from "../donation/DonationModal";
import { Clock, MessageSquare, Calendar, Heart } from "lucide-react";

import { PrayerTimes, Coordinates, CalculationMethod } from "adhan";
import { parsePostGisPoint } from "@/lib/utils/postgis";

interface ProfileTabsProps {
  masjidId: string;
  programs: any[];
  projects: any[];
  gps_location?: string;
  timezone?: string;
}

export default function ProfileTabs({ masjidId, programs, projects, gps_location, timezone }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"prayer" | "social" | "programs" | "projects">("prayer");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  return (
    <div className="mt-8">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
        <button 
          onClick={() => setActiveTab("prayer")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${activeTab === "prayer" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Clock className="w-4 h-4" /> Prayer Schedule
        </button>
        <button 
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${activeTab === "social" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <MessageSquare className="w-4 h-4" /> Social Timeline
        </button>
        <button 
          onClick={() => setActiveTab("programs")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${activeTab === "programs" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Calendar className="w-4 h-4" /> Programs & Events
        </button>
        <button 
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${activeTab === "projects" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Heart className="w-4 h-4" /> Active Projects
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === "prayer" && (() => {
          let prayerTimesObj = null;
          let nextPrayer = "";
          
          if (gps_location) {
            const coords = parsePostGisPoint(gps_location);
            if (coords) {
              const coordinates = new Coordinates(coords.lat, coords.lng);
              const params = CalculationMethod.MuslimWorldLeague();
              const date = new Date();
              prayerTimesObj = new PrayerTimes(coordinates, date, params);
              
              const currentPrayer = prayerTimesObj.currentPrayer();
              nextPrayer = prayerTimesObj.nextPrayer();
              // Adhan returns 'none' if there is no next prayer today
            }
          }

          const formatTime = (date?: Date) => {
            if (!date) return "--:--";
            
            // If the masjid has a timezone, format to that timezone, 
            // otherwise fallback to the user's local device timezone.
            const options: Intl.DateTimeFormatOptions = {
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            };
            if (timezone) {
              options.timeZone = timezone;
            }
            
            return date.toLocaleTimeString("en-ZA", options);
          };

          const addMinutes = (date?: Date, minutes = 15) => {
            if (!date) return "--:--";
            return formatTime(new Date(date.getTime() + minutes * 60000));
          };

          const prayers = [
            { id: "fajr", name: "Fajr", time: prayerTimesObj?.fajr },
            { id: "dhuhr", name: "Dhuhr", time: prayerTimesObj?.dhuhr },
            { id: "asr", name: "Asr", time: prayerTimesObj?.asr },
            { id: "maghrib", name: "Maghrib", time: prayerTimesObj?.maghrib },
            { id: "isha", name: "Isha", time: prayerTimesObj?.isha },
          ];

          return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-4 font-semibold text-slate-600 text-sm">
                <div>Prayer</div>
                <div className="text-center">Adhan (Calculated)</div>
                <div className="text-right">Iqama (Congregation)</div>
              </div>
              
              {prayerTimesObj ? (
                prayers.map((prayer) => {
                  const isNext = nextPrayer === prayer.id;
                  
                  return (
                    <div 
                      key={prayer.id}
                      className={`grid grid-cols-3 p-4 items-center ${
                        isNext 
                          ? "border border-[#D4AF37] bg-[#D4AF37]/5 relative shadow-sm z-10" 
                          : "border-b border-slate-100 last:border-0"
                      }`}
                    >
                      {isNext && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />}
                      <div className={`font-medium ${isNext ? "text-[#D4AF37] font-semibold" : "text-slate-900"}`}>
                        {prayer.name} {isNext && "(Next)"}
                      </div>
                      <div className={`text-center ${isNext ? "text-slate-600" : "text-slate-500"}`}>
                        {formatTime(prayer.time)}
                      </div>
                      <div className={`text-right ${isNext ? "font-bold text-[#0F172A]" : "font-medium text-slate-700"}`}>
                        {addMinutes(prayer.time, 15)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>Prayer times are currently unavailable for this location.</p>
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === "social" && (
          <RealtimePostFeed masjidId={masjidId} />
        )}

        {activeTab === "programs" && (
          <div className="grid gap-4 md:grid-cols-2">
            {programs && programs.length > 0 ? (
              programs.map(prog => (
                <div key={prog.id} className="bg-white p-5 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{prog.target_audience || 'General'}</span>
                  <h4 className="font-semibold mt-3 text-lg">{prog.title}</h4>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2">{prog.description}</p>
                  <button className="mt-4 text-sm font-medium text-[#D4AF37] hover:underline">Add to Calendar</button>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-xl">
                No upcoming programs scheduled.
              </div>
            )}
          </div>
        )}

        {activeTab === "projects" && (
          <div className="grid gap-6">
            {projects && projects.length > 0 ? (
              projects.map(proj => (
                <div key={proj.id} className="bg-white p-6 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-lg">{proj.title}</h4>
                  <p className="text-slate-600 mt-2">{proj.description}</p>
                  
                  {proj.goal_amount && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">R {proj.current_amount || 0} raised</span>
                        <span className="text-slate-500">of R {proj.goal_amount}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-[#D4AF37] h-2 rounded-full" 
                          style={{ width: `${Math.min(100, ((proj.current_amount || 0) / proj.goal_amount) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setSelectedProject(proj)}
                    className="mt-6 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors w-full sm:w-auto"
                  >
                    Donate Now
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-xl">
                No active donation projects.
              </div>
            )}
          </div>
        )}
      </div>

      {selectedProject && (
        <DonationModal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          projectId={selectedProject.id}
          masjidId={masjidId}
          projectTitle={selectedProject.title}
        />
      )}
    </div>
  );
}
