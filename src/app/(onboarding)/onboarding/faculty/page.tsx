"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2, PlusCircle } from "lucide-react";
import Image from "next/image";

type Masjid = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
};

export default function FacultyOnboardingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchMasjids() {
      if (searchQuery.length < 2) {
        setMasjids([]);
        return;
      }

      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await (supabase as any).from("masjids")
        .select("id, name, city, country, address")
        .ilike("name", `%${searchQuery}%`)
        .limit(10);

      if (error) {
        console.error("Error fetching masjids:", error);
      } else {
        setMasjids(data || []);
      }
      setIsLoading(false);
    }

    const delayDebounceFn = setTimeout(() => {
      fetchMasjids();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="w-full max-w-6xl bg-surface border border-border rounded-2xl shadow-xl overflow-hidden animate-fade-up grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column: Form */}
      <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Claim Your Masjid
          </h1>
          <p className="mt-2 text-muted-foreground">
            Search for your congregation to verify your role as an official representative and gain access to the dashboard.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border border-border bg-background py-4 pl-10 pr-3 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-lg shadow-sm"
              placeholder="Search by masjid name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {masjids.length > 0 ? (
            masjids.map((masjid) => (
              <div
                key={masjid.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background p-4 shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {masjid.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {masjid.city}, {masjid.country}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/masjids/${masjid.id}/claim`)}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent/90 transition-colors"
                >
                  Claim Profile
                </button>
              </div>
            ))
          ) : searchQuery.length >= 2 && !isLoading ? (
            <div className="rounded-xl border border-border bg-background p-8 text-center flex flex-col items-center shadow-sm">
              <p className="text-muted-foreground mb-4">We couldn't find your masjid in our database.</p>
              <button className="flex items-center rounded-lg border border-accent text-accent px-4 py-2 text-sm font-semibold hover:bg-accent/10 transition-colors">
                <PlusCircle className="mr-2 h-4 w-4" />
                Register a New Masjid
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block relative bg-[#0F172A]">
        <Image
          src="/media/For Masjids (Claiming Faculty Focus).png"
          alt="Masjid Faculty Management"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
