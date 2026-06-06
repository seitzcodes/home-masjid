"use client";

import React, { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface RealtimeNotificationWrapperProps {
  children: React.ReactNode;
}

export default function RealtimeNotificationWrapper({ children }: RealtimeNotificationWrapperProps) {
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setupRealtime() {
      // 1. Get the current user's profile to find their home_masjid_id
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: profile } = await (supabase as any).from('user_profiles')
        .select('home_masjid_id')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.home_masjid_id) return;

      const homeMasjidId = profile.home_masjid_id;

      // 2. Subscribe to new programs for this specific masjid
      channel = supabase
        .channel('schema-db-changes-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'home_masjid',
            table: 'programs',
            filter: `masjid_id=eq.${homeMasjidId}`
          },
          (payload) => {
            const newProgram = payload.new;
            
            // Don't show toast if they are already on the masjid's profile page looking at it
            if (pathname === `/masjids/${homeMasjidId}`) return;

            toast("New Program Announced!", {
              description: newProgram.title,
              icon: <Bell className="w-5 h-5 text-[#D4AF37]" />,
              action: {
                label: "View",
                onClick: () => router.push(`/masjids/${homeMasjidId}`)
              },
              duration: 8000,
            });
          }
        )
        .subscribe();
    }

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, pathname, router]);

  return <>{children}</>;
}
