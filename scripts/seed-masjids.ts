import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import path from "path";
import tzlookup from "tz-lookup";

// Load environment variables from .env.local
const projectDir = path.resolve(__dirname, "..");
loadEnvConfig(projectDir);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

// Initialize Supabase client with Service Role to bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: "home_masjid" },
});

// Overpass QL Query for South African Masjids
const OVERPASS_QUERY = `
  [out:json][timeout:60];
  area["ISO3166-1"="ZA"][admin_level=2]->.searchArea;
  (
    node["amenity"="place_of_worship"]["religion"="muslim"](area.searchArea);
    way["amenity"="place_of_worship"]["religion"="muslim"](area.searchArea);
  );
  out center;
`;

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Helper for delaying requests (to avoid Mapbox rate limits)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchMasjidsFromOverpass() {

  console.log("Fetching masjids from OpenStreetMap (Overpass API)...");
  const url = `${OVERPASS_URL}?data=${encodeURIComponent(OVERPASS_QUERY)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { 
      "User-Agent": "HomeMasjid/1.0 (contact@seitz.codes)",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Overpass API Error: ${response.status} ${response.statusText} - ${text}`);
  }

  const data = await response.json();
  console.log(`Found ${data.elements.length} masjids via Overpass.`);
  return data.elements;
}

async function reverseGeocodeMapbox(lon: number, lat: number) {
  if (!MAPBOX_API_KEY) return { city: "Unknown", address: "Unknown Address" };

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?types=place,address&access_token=${MAPBOX_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return { city: "Unknown", address: "Unknown Address" };

    const data = await response.json();
    let city = "Unknown";
    let address = "Unknown Address";

    if (data.features && data.features.length > 0) {
      // Find place (city/town)
      const placeFeature = data.features.find((f: any) =>
        f.place_type.includes("place")
      );
      if (placeFeature) city = placeFeature.text;

      // Find address
      const addressFeature = data.features.find((f: any) =>
        f.place_type.includes("address")
      );
      if (addressFeature) {
        address = addressFeature.place_name;
      } else if (placeFeature) {
        address = placeFeature.place_name;
      }
    }
    return { city, address };
  } catch (error) {
    console.error("Mapbox error:", error);
    return { city: "Unknown", address: "Unknown Address" };
  }
}

async function seed() {
  try {
    const elements = await fetchMasjidsFromOverpass();
    const masjidsToInsert = [];

    // Process elements starting from index 100
    const startIndex = 100;
    const maxElements = elements.length;

    console.log(`Processing masjids from index ${startIndex} to ${maxElements}...`);

    for (let i = startIndex; i < maxElements; i++) {
      const el = elements[i];
      
      // Determine lat/lon based on element type
      const lat = el.type === "node" ? el.lat : el.center?.lat;
      const lon = el.type === "node" ? el.lon : el.center?.lon;

      if (!lat || !lon) continue;

      let name = el.tags?.name || el.tags?.["name:en"] || "Community Masjid";
      
      // Basic fallback properties if Mapbox fails or is missing
      let city = el.tags?.["addr:city"] || "Unknown City";
      let address = el.tags?.["addr:street"] 
        ? `${el.tags["addr:housenumber"] || ""} ${el.tags["addr:street"]}`.trim() 
        : "Unknown Address";

      // Enhance with Mapbox if needed
      if (MAPBOX_API_KEY && (city === "Unknown City" || address === "Unknown Address")) {
        // Sleep slightly to respect Mapbox rate limits
        await delay(100);
        const geoInfo = await reverseGeocodeMapbox(lon, lat);
        if (city === "Unknown City" && geoInfo.city !== "Unknown") city = geoInfo.city;
        if (address === "Unknown Address" && geoInfo.address !== "Unknown Address") address = geoInfo.address;
      }

      // Convert coordinate to WKT format for PostGIS
      const pointWKT = `POINT(${lon} ${lat})`;

      let timezone = null;
      try {
        timezone = tzlookup(lat, lon);
      } catch (e) {
        console.error(`Error resolving timezone for ${name}:`, e);
      }

      masjidsToInsert.push({
        name,
        address,
        city,
        country: "South Africa",
        gps_location: pointWKT, // Supabase automatically handles WKT strings for geography fields
        is_verified: false,
        timezone,
      });

      process.stdout.write(`\rProcessed ${i + 1}/${maxElements}`);
    }
    console.log("\\nFinished processing. Inserting into Supabase...");

    // Insert in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < masjidsToInsert.length; i += BATCH_SIZE) {
      const batch = masjidsToInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("masjids").insert(batch);
      
      if (error) {
        console.error(`\\nError inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
      } else {
        console.log(`\\nSuccessfully inserted batch ${i / BATCH_SIZE + 1}`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seed();
