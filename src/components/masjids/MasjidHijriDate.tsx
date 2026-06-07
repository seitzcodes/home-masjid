"use client";

import { useHijriDate } from "@/hooks/useHijriDate";
import { Moon } from "lucide-react";

export function MasjidHijriDate({ gpsLocation }: { gpsLocation: string }) {
  const hijriInfo = useHijriDate(gpsLocation);

  if (!hijriInfo) return null;

  return (
    <div className="flex items-center text-sm font-medium text-amber-700 dark:text-[#D4AF37] px-3 py-1.5 rounded-full bg-surface border border-border shrink-0">
      <Moon className="w-4 h-4 mr-2" />
      {hijriInfo.dateStr}
    </div>
  );
}
