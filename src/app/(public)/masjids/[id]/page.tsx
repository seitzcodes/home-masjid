import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Calendar, Heart, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// Function to fetch prayer times from AlAdhan API
async function getPrayerTimes(lat: number, lng: number) {
  try {
    const res = await fetch(`http://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data.timings;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
}

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

export default async function MasjidProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Fetch Masjid details
  const { data: masjid, error } = await supabase
    .from('masjids')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !masjid) {
    notFound();
  }

  // Parse location and fetch prayer times
  const coords = masjid.gps_location ? parsePoint(masjid.gps_location as string) : null;
  const prayerTimes = coords ? await getPrayerTimes(coords.lat, coords.lng) : null;

  return (
    <div className="container mx-auto py-8 lg:py-12">
      <div className="mb-6">
        <Link href="/masjids" className="text-sm text-primary hover:underline">
          &larr; Back to Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{masjid.name}</h1>
              {masjid.is_verified && (
                <div className="flex items-center text-primary bg-primary/10 px-3 py-1 rounded-full text-sm font-medium">
                  <ShieldCheck size={16} className="mr-1" />
                  Verified
                </div>
              )}
            </div>
            
            <div className="flex items-center text-muted-foreground mb-6">
              <MapPin size={18} className="mr-2" />
              <span>{masjid.address}, {masjid.city}, {masjid.country}</span>
            </div>

            <div className="prose prose-sm md:prose-base dark:prose-invert">
              <p>{masjid.description || "No description provided for this masjid."}</p>
            </div>
          </div>

          {/* About/Programs Placeholder */}
          <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 text-primary" />
              Community Programs
            </h2>
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <p>Programs and events will appear here.</p>
              {!masjid.is_verified && (
                <p className="text-sm mt-2">Are you a faculty member? <Link href="/register" className="text-primary hover:underline">Claim this masjid</Link> to post programs.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="col-span-1 space-y-8">
          {/* Prayer Times Widget */}
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="mr-2 text-primary" />
              Prayer Times
            </h3>
            
            {prayerTimes ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Fajr</span>
                  <span className="text-muted-foreground">{prayerTimes.Fajr}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Sunrise</span>
                  <span className="text-muted-foreground">{prayerTimes.Sunrise}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Dhuhr</span>
                  <span className="text-muted-foreground">{prayerTimes.Dhuhr}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Asr</span>
                  <span className="text-muted-foreground">{prayerTimes.Asr}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Maghrib</span>
                  <span className="text-muted-foreground">{prayerTimes.Maghrib}</span>
                </div>
                <div className="flex justify-between items-center py-2 pt-2">
                  <span className="font-medium">Isha</span>
                  <span className="text-muted-foreground">{prayerTimes.Isha}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Powered by AlAdhan
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Prayer times unavailable for this location.</p>
            )}
          </div>

          {/* Follow / Support Widget */}
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <Heart size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Support Your Masjid</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get notified about programs and support community projects.
            </p>
            <button className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary-light transition-colors">
              Set as Home Masjid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
