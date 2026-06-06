'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Navigation } from 'lucide-react';

interface Masjid {
  id: string;
  name: string;
  city: string;
  country: string;
  distance_meters?: number;
  is_verified: boolean;
  gps_location?: string;
  lat?: number;
  lng?: number;
}

interface DirectoryMapProps {
  mapboxAccessToken: string;
}

export function DirectoryMap({ mapboxAccessToken }: DirectoryMapProps) {
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMasjid, setSelectedMasjid] = useState<Masjid | null>(null);

  const supabase = createClient();

  // Parse POINT(lng lat) into { lat, lng }
  const parsePoint = (pointStr: string) => {
    if (!pointStr) return null;
    // If it's Well-Known Binary (Hex), e.g., 0101000020E6100000...
    if (pointStr.startsWith('0101000020')) {
      const hexToFloat64 = (hex: string) => {
        const buf = new ArrayBuffer(8);
        const view = new DataView(buf);
        const matches = hex.match(/.{2}/g);
        if (matches) {
          matches.forEach((byte, i) => view.setUint8(i, parseInt(byte, 16)));
        }
        return view.getFloat64(0, true);
      };
      const lngHex = pointStr.substring(18, 34);
      const latHex = pointStr.substring(34, 50);
      return { lng: hexToFloat64(lngHex), lat: hexToFloat64(latHex) };
    }
    
    // Fallback for WKT (Well-Known Text)
    const match = pointStr.match(/POINT\(([^ ]+) ([^)]+)\)/);
    if (match) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
    return null;
  };

  const fetchNearbyMasjids = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    const { data, error } = await (supabase as any).rpc('get_nearest_masjids', {
      user_lat: lat,
      user_lng: lng,
      max_distance_meters: 500000 // 500km
    });

    if (error) {
      console.error('Error fetching nearby masjids:', error);
      setLoading(false);
      return;
    }

    // Since RPC doesn't return the raw gps_location, we need to fetch the coordinates 
    // for these masjids to display them on the map. Let's just fetch all verified masjids and compute.
    // Actually, we can fetch all verified masjids and their locations, since we have only ~20.
    fetchAllMasjids();
  }, [supabase]);

  const fetchAllMasjids = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from('masjids')
      .select('id, name, city, country, is_verified, gps_location')
      .eq('is_verified', true);

    if (error) {
      console.error('Error fetching masjids:', error);
      setLoading(false);
      return;
    }

    const formattedMasjids: Masjid[] = (data || []).map((m: any) => {
      const coords = parsePoint(m.gps_location as string) || { lat: 0, lng: 0 };
      return {
        id: m.id,
        name: m.name,
        city: m.city,
        country: m.country,
        is_verified: !!m.is_verified,
        gps_location: m.gps_location as string,
        lat: coords.lat,
        lng: coords.lng
      };
    });

    setMasjids(formattedMasjids);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAllMasjids();
  }, [fetchAllMasjids]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-lg border border-border">
      <Map
        mapboxAccessToken={mapboxAccessToken}
        initialViewState={{
          longitude: 25.0, // Center on SA roughly
          latitude: -29.0,
          zoom: 4
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />

        {masjids.map((masjid) => (
          masjid.lat && masjid.lng ? (
            <Marker
              key={masjid.id}
              longitude={masjid.lng}
              latitude={masjid.lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedMasjid(masjid);
              }}
            >
              <div className="bg-primary text-primary-foreground p-2 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
            </Marker>
          ) : null
        ))}

        {selectedMasjid && selectedMasjid.lat && selectedMasjid.lng && (
          <Popup
            longitude={selectedMasjid.lng}
            latitude={selectedMasjid.lat}
            anchor="top"
            onClose={() => setSelectedMasjid(null)}
            closeOnClick={false}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-lg">{selectedMasjid.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedMasjid.city}, {selectedMasjid.country}</p>
              <div className="mt-3">
                <a href={`/masjids/${selectedMasjid.id}`} className="text-sm text-primary hover:underline font-medium">
                  View Profile &rarr;
                </a>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
