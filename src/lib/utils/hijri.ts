import { PrayerTimes, Coordinates, CalculationMethod } from "adhan";
import { parsePostGisPoint } from "./postgis";

export interface HijriDateInfo {
  dateStr: string;
  isAfterMaghrib: boolean;
  latitude: number;
  longitude: number;
}

export function getAdjustedHijriDate(date: Date, gps_location?: string | null): HijriDateInfo {
  let adjustedDate = new Date(date);
  let isAfterMaghrib = false;
  
  // Default to Johannesburg, South Africa
  let lat = -26.2041;
  let lng = 28.0473;

  if (gps_location) {
    const parsed = parsePostGisPoint(gps_location);
    if (parsed) {
      lat = parsed.lat;
      lng = parsed.lng;
    }
  }

  const coordinates = new Coordinates(lat, lng);
  const params = CalculationMethod.MuslimWorldLeague();
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  if (date.getTime() >= prayerTimes.maghrib.getTime()) {
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    isAfterMaghrib = true;
  }

  // Format the date using the browser's native Intl API
  const formatter = new Intl.DateTimeFormat('en-ZA-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return {
    dateStr: formatter.format(adjustedDate),
    isAfterMaghrib,
    latitude: lat,
    longitude: lng
  };
}
