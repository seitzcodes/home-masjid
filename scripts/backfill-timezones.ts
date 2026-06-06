import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import path from "path";
import tzlookup from "tz-lookup";

const projectDir = path.resolve(__dirname, "..");
loadEnvConfig(projectDir);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: "home_masjid" },
});

export function parsePostGisPoint(pointStr: string | any): { lat: number, lng: number } | null {
  if (!pointStr) return null;
  
  if (typeof pointStr === 'string') {
    // If it's Well-Known Binary (Hex), e.g., 0101000020E6100000...
    if (pointStr.startsWith('0101000020') || pointStr.startsWith('0101000000')) {
      const offset = pointStr.startsWith('0101000020') ? 18 : 10;
      
      const hexToFloat64 = (hex: string) => {
        const buf = new ArrayBuffer(8);
        const view = new DataView(buf);
        const matches = hex.match(/.{2}/g);
        if (matches) {
          matches.forEach((byte, i) => view.setUint8(i, parseInt(byte, 16)));
        }
        return view.getFloat64(0, true); // true for little-endian
      };
      
      const lngHex = pointStr.substring(offset, offset + 16);
      const latHex = pointStr.substring(offset + 16, offset + 32);
      
      return { 
        lng: hexToFloat64(lngHex), 
        lat: hexToFloat64(latHex) 
      };
    }
    
    // Fallback for WKT (Well-Known Text)
    const match = pointStr.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
    if (match) {
      return { 
        lng: parseFloat(match[1]), 
        lat: parseFloat(match[2]) 
      };
    }
  } else if (pointStr.coordinates) {
    // GeoJSON
    return { 
      lng: pointStr.coordinates[0], 
      lat: pointStr.coordinates[1] 
    };
  }
  
  return null;
}

async function backfillTimezones() {
  console.log("Starting timezone backfill...");

  const { data: masjids, error } = await supabase
    .from("masjids")
    .select("id, name, gps_location");

  if (error || !masjids) {
    console.error("Error fetching masjids:", error);
    process.exit(1);
  }

  console.log(`Found ${masjids.length} masjids. Calculating timezones...`);

  let successCount = 0;
  let errorCount = 0;

  for (const masjid of masjids) {
    const coords = parsePostGisPoint(masjid.gps_location);
    if (coords) {
      try {
        const tz = tzlookup(coords.lat, coords.lng);
        const { error: updateError } = await supabase
          .from("masjids")
          .update({ timezone: tz })
          .eq("id", masjid.id);

        if (updateError) {
          console.error(`Failed to update ${masjid.name}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
          process.stdout.write(`\rProgress: ${successCount + errorCount}/${masjids.length}`);
        }
      } catch (e) {
        console.error(`\nError calculating tz for ${masjid.name}:`, e);
        errorCount++;
      }
    } else {
      console.log(`\nMasjid ${masjid.name} has no valid gps_location.`);
      errorCount++;
    }
  }

  console.log(`\n\nBackfill complete! Success: ${successCount}, Errors: ${errorCount}`);
}

backfillTimezones();
