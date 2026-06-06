import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MapPin, Users, CheckCircle, Navigation, Heart, RefreshCw } from "lucide-react";
import ProfileTabs from "@/components/masjids/ProfileTabs";
import { Metadata, ResolvingMetadata } from "next";
import { parsePostGisPoint } from "@/lib/utils/postgis";
import { DonationSuccessBanner } from "@/components/donation/DonationSuccessBanner";

export const revalidate = 3600; // Revalidate every hour

// Need to ensure the params are handled correctly for Next.js 15+ async params if applicable, 
// but using standard props for now.
interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ donation?: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: masjid } = await (supabase as any).from("masjids")
    .select("name, city, country, address")
    .eq("id", id)
    .single();

  if (!masjid) return { title: "Masjid Not Found" };

  const title = `${masjid.name} | Home Masjid`;
  const description = `View prayer times, programs, and community projects at ${masjid.name} in ${masjid.city}, ${masjid.country}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MasjidProfilePage({ params, searchParams }: Props) {
  const { id: masjidId } = await params;
  const { donation: donationStatus } = await searchParams;
  const supabase = await createClient();

  // The user instructed us to fetch related data (programs, projects) 
  // Make sure these tables exist, if they don't the query will fail.
  // We'll use a safe query first, and try to get relationships if available.
  const { data: masjid, error } = await (supabase as any).from("masjids")
    .select(`
      id,
      name,
      address,
      city,
      country,
      is_verified,
      gps_location,
      timezone
    `)
    .eq("id", masjidId)
    .single();

  if (error || !masjid) {
    notFound();
  }

  // Safely fetch programs and projects separately in case relations aren't built
  const { data: programs } = await (supabase as any).from("programs")
    .select("*")
    .eq("masjid_id", masjidId);

  const { data: projects } = await (supabase as any).from("projects")
    .select("*")
    .eq("masjid_id", masjidId);

  // Fetch recent donors for the donor wall
  // We join via projects -> donations -> user_profiles
  const projectIds = (projects ?? []).map((p: any) => p.id);
  let recentDonors: {
    id: string;
    amount: number;
    is_anonymous: boolean;
    is_recurring: boolean;
    project_title: string;
    donor_name: string | null;
    created_at: string | null;
  }[] = [];

  if (projectIds.length > 0) {
    const { data: donations } = await (supabase as any).from("donations")
      .select("id, amount, is_anonymous, is_recurring, project_id, user_id, created_at")
      .in("project_id", projectIds)
      .eq("payment_status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);

    if (donations && donations.length > 0) {
      const donorUserIds = [
        ...new Set(
          donations.filter((d: any) => !d.is_anonymous && d.user_id).map((d: any) => d.user_id!)
        ),
      ];
      const profileMap: Record<string, string> = {};
      if (donorUserIds.length > 0) {
        const { data: profiles } = await (supabase as any).from("user_profiles")
          .select("id, full_name")
          .in("id", donorUserIds);
        profiles?.forEach((p: any) => { profileMap[p.id] = p.full_name; });
      }
      const projectTitleMap: Record<string, string> = {};
      projects?.forEach((p: any) => { projectTitleMap[p.id] = p.title; });

      recentDonors = donations.map((d: any) => ({
        id: d.id,
        amount: d.amount,
        is_anonymous: d.is_anonymous ?? false,
        is_recurring: d.is_recurring ?? false,
        project_title: projectTitleMap[d.project_id!] ?? "Community Project",
        donor_name: d.is_anonymous ? null : (d.user_id ? profileMap[d.user_id] ?? null : null),
        created_at: d.created_at,
      }));
    }
  }

  // Parse location to pass to map
  let lat = null, lon = null;
  const coords = parsePostGisPoint(masjid.gps_location);
  if (coords) {
    lon = coords.lng;
    lat = coords.lat;
  }

  // Generate JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Mosque",
    "name": masjid.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": masjid.address || "",
      "addressLocality": masjid.city,
      "addressCountry": masjid.country
    },
    ...(lat && lon ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": lat,
        "longitude": lon
      }
    } : {})
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Donation Success Banner */}
      {donationStatus === "success" && <DonationSuccessBanner masjidName={masjid.name} />}

      {/* Header Banner */}
      <div className="bg-[#0F172A] text-white pt-20 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold flex items-center gap-3">
                {masjid.name}
                {masjid.is_verified && (
                  <span className="flex items-center gap-1 text-sm bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full font-medium border border-[#D4AF37]/30 align-middle mt-2">
                    <CheckCircle className="w-4 h-4" /> Verified
                  </span>
                )}
              </h1>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{masjid.address ? `${masjid.address}, ` : ''}{masjid.city}, {masjid.country}</span>
                </div>
                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>245 Followers</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Desktop */}
            <div className="hidden md:flex gap-3">
              <button className="px-5 py-2.5 bg-white text-[#0F172A] rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                Follow Updates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip (Mobile + Desktop) */}
      <div className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-700 sticky top-16 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex gap-3 overflow-x-auto hide-scrollbar">
          <button className="flex-1 md:flex-none whitespace-nowrap px-4 py-2 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Set as Home Masjid
          </button>
          <button className="flex-1 md:hidden whitespace-nowrap px-4 py-2 bg-[#0F172A] text-white rounded-lg font-medium">
            Follow Updates
          </button>
          {lat && lon && (
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Navigation className="w-4 h-4" /> Directions
            </a>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 mt-6 space-y-8">
        <ProfileTabs 
          masjidId={masjidId} 
          programs={programs || []} 
          projects={projects || []} 
          gps_location={masjid.gps_location}
          timezone={masjid.timezone}
        />

        {/* Recent Donors Wall */}
        {recentDonors.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#D4AF37]" />
              Recent Supporters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentDonors.map((donor) => (
                <div
                  key={donor.id}
                  className="flex items-center gap-3 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700 rounded-xl p-3.5 shadow-sm"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#0F172A] dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <span className="text-[#D4AF37] font-bold text-sm">
                      {donor.is_anonymous
                        ? "A"
                        : donor.donor_name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {donor.is_anonymous ? (
                        <span className="italic text-muted-foreground">Anonymous</span>
                      ) : (
                        donor.donor_name ?? "Community Member"
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      donated to <span className="font-medium text-foreground">{donor.project_title}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#D4AF37]">
                      R{donor.amount.toLocaleString()}
                    </p>
                    {donor.is_recurring && (
                      <span className="flex items-center gap-0.5 text-xs text-purple-500 dark:text-purple-400 justify-end">
                        <RefreshCw className="w-2.5 h-2.5" /> monthly
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
