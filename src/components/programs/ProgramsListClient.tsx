"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, MapPin, Users } from "lucide-react";

export interface Program {
  id: string;
  masjid_id: string;
  title: string;
  description: string;
  target_audience: string;
  masjids?: {
    id: string;
    name: string;
    city: string | null;
  };
}

export default function ProgramsListClient({ initialPrograms }: { initialPrograms: Program[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAudience, setActiveAudience] = useState<string>("All");

  // Derive unique audiences from the data
  const audiences = ["All", ...Array.from(new Set(initialPrograms.map(p => p.target_audience || "General")))];

  const filteredPrograms = initialPrograms.filter((program) => {
    const matchesSearch = 
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (program.description && program.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (program.masjids?.name && program.masjids.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesAudience = 
      activeAudience === "All" || 
      (program.target_audience || "General") === activeAudience;

    return matchesSearch && matchesAudience;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Community Programs</h1>
          <p className="text-muted-foreground mt-2">Discover educational classes and community events.</p>
        </div>
        
        <div className="w-full md:w-96 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
            placeholder="Search programs or masjids..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Audience Filters */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-8 hide-scrollbar">
        {audiences.map((audience) => (
          <button
            key={audience}
            onClick={() => setActiveAudience(audience)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeAudience === audience
                ? "bg-primary text-primary-foreground"
                : "bg-surface border border-border text-foreground hover:border-primary/50"
            }`}
          >
            {audience}
          </button>
        ))}
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div key={program.id} className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-primary/30">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    <Users className="w-3.5 h-3.5" />
                    {program.target_audience || "General"}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                  {program.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                  {program.description}
                </p>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="truncate">{program.masjids?.name || "Unknown Masjid"}</span>
                  </div>
                  {program.masjids?.city && (
                    <div className="text-xs text-muted-foreground ml-6">
                      {program.masjids.city}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-border p-4 bg-surface-hover flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Upcoming</span>
                </div>
                <Link
                  href={`/masjids/${program.masjid_id}`}
                  className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  View Masjid
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No programs found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            We couldn't find any programs matching your search criteria. Try adjusting your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveAudience("All");
            }}
            className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
