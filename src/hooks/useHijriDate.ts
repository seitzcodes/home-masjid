import { useState, useEffect } from 'react';
import { getAdjustedHijriDate, HijriDateInfo } from '@/lib/utils/hijri';

export function useHijriDate(gps_location?: string | null) {
  const [hijriInfo, setHijriInfo] = useState<HijriDateInfo | null>(null);

  useEffect(() => {
    let currentLocStr = gps_location;

    const updateDate = () => {
      setHijriInfo(getAdjustedHijriDate(new Date(), currentLocStr));
    };

    if (currentLocStr) {
      updateDate();
    } else {
      // Prompt user for location if not provided
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            currentLocStr = `POINT(${position.coords.longitude} ${position.coords.latitude})`;
            updateDate();
          },
          (error) => {
            console.warn("Geolocation denied/failed. Falling back to default.", error);
            updateDate();
          }
        );
      } else {
        updateDate();
      }
    }

    // Recalculate every minute to catch the Maghrib rollover if the user keeps the tab open
    const interval = setInterval(() => {
      updateDate();
    }, 60000);

    return () => clearInterval(interval);
  }, [gps_location]);

  return hijriInfo;
}
