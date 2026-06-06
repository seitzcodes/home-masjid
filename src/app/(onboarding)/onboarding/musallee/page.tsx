"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Masjid = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
};

export default function MusalleeOnboardingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSelectMasjid(masjidId: string) {
    setIsSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await (supabase as any).from("user_profiles")
        .update({ home_masjid_id: masjidId })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      router.push("/masjids"); // Redirect to public masjids list for now
    } catch (err: any) {
      setError(err.message || "Failed to set home masjid");
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full max-w-6xl bg-surface border border-border rounded-2xl shadow-xl overflow-hidden animate-fade-up grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column: Form */}
      <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Find your Home Masjid
          </h1>
          <p className="mt-2 text-muted-foreground">
            Search for your local masjid to follow their programs, events, and
            updates.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border border-border bg-background py-4 pl-10 pr-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-lg shadow-sm"
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
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
                  onClick={() => handleSelectMasjid(masjid.id)}
                  disabled={isSaving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Set as Home"}
                </button>
              </div>
            ))
          ) : searchQuery.length >= 2 && !isLoading ? (
            <div className="rounded-xl border border-border bg-background p-8 text-center shadow-sm">
              <p className="text-muted-foreground">No masjids found.</p>
            </div>
          ) : null}
        </div>

        <div className="mt-12 flex items-center justify-center">
          <button
            onClick={() => router.push("/masjids")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip this step for now
          </button>
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block relative bg-[#0F172A]">
        <Image
          src="/media/For Users (Designating a 'Home Masjid').png"
          alt="Home Masjid User Experience"
          fill
          priority
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
