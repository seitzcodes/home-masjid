"use client";

import React, { useState, useEffect } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/mapbox";
import 'mapbox-gl/dist/mapbox-gl.css';
import { Home, MapPin } from "lucide-react";

interface Masjid {
  id: string;
  name: string;
  gps_location?: any; // e.g. { coordinates: [lon, lat] }
  distance_meters?: number;
  is_verified: boolean;
}

interface MasjidMapProps {
  masjids: Masjid[];
  homeMasjidId?: string;
  userLocation?: { latitude: number; longitude: number } | null;
}

export default function MasjidMap({ masjids, homeMasjidId, userLocation }: MasjidMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 28.0473, // Default to South Africa
    latitude: -26.2041,
    zoom: 5
  });

  const [selectedMasjid, setSelectedMasjid] = useState<Masjid | null>(null);

  useEffect(() => {
    if (userLocation) {
      setViewState(prev => ({
        ...prev,
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
        zoom: 11
      }));
    }
  }, [userLocation]);

  return (
    <div className="w-full h-full relative bg-slate-900 rounded-xl overflow-hidden">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY2x4bHp6ZXIzMHZ0djJrcHJwNm1rN2pqciJ9.placeholder"}
      >
        <NavigationControl position="bottom-right" />

        {userLocation && (
          <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
          </Marker>
        )}

        {masjids.map((masjid) => {
          // Parse PostGIS POINT string if it comes through as string, or use object if parsed
          let lon = 0, lat = 0;
          if (typeof masjid.gps_location === 'string') {
            const match = masjid.gps_location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
            if (match) {
              lon = parseFloat(match[1]);
              lat = parseFloat(match[2]);
            }
          } else if (masjid.gps_location?.coordinates) {
            lon = masjid.gps_location.coordinates[0];
            lat = masjid.gps_location.coordinates[1];
          }

          if (lon === 0 && lat === 0) return null;

          const isHome = masjid.id === homeMasjidId;
          const isVerified = masjid.is_verified;

          return (
            <Marker 
              key={masjid.id} 
              longitude={lon} 
              latitude={lat}
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedMasjid(masjid);
              }}
            >
              <div className={`cursor-pointer transition-transform hover:scale-110 flex flex-col items-center justify-center ${isHome ? 'animate-pulse' : ''}`}>
                {isHome ? (
                  <div className="bg-[#D4AF37] p-1.5 rounded-full shadow-lg shadow-[#D4AF37]/50 border-2 border-white">
                    <Home className="w-4 h-4 text-[#0F172A]" />
                  </div>
                ) : (
                  <div className={`rounded-full shadow-md border-2 border-white ${isVerified ? 'bg-[#D4AF37] w-4 h-4' : 'bg-slate-500 w-3 h-3'}`} />
                )}
              </div>
            </Marker>
          );
        })}

        {selectedMasjid && (() => {
          let lon = 0, lat = 0;
          if (typeof selectedMasjid.gps_location === 'string') {
            const match = selectedMasjid.gps_location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
            if (match) {
              lon = parseFloat(match[1]);
              lat = parseFloat(match[2]);
            }
          } else if (selectedMasjid.gps_location?.coordinates) {
            lon = selectedMasjid.gps_location.coordinates[0];
            lat = selectedMasjid.gps_location.coordinates[1];
          }

          return (
            <Popup
              longitude={lon}
              latitude={lat}
              anchor="bottom"
              onClose={() => setSelectedMasjid(null)}
              closeOnClick={false}
              className="z-50"
            >
              <div className="p-1">
                <h4 className="font-semibold text-slate-900">{selectedMasjid.name}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedMasjid.is_verified ? 'Verified Masjid' : 'Community Listed'}
                </p>
                <div className="mt-2 text-xs font-medium text-[#D4AF37]">
                  Next: Youth Coding Camp - 5:00 PM
                </div>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block text-center w-full bg-[#0F172A] text-white py-1.5 rounded-md text-xs hover:bg-slate-800"
                >
                  Get Directions
                </a>
              </div>
            </Popup>
          );
        })()}
      </Map>
    </div>
  );
}
