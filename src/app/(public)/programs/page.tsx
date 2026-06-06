import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProgramsListClient, { Program } from "@/components/programs/ProgramsListClient";

export const metadata: Metadata = {
  title: "Programs | Home Masjid",
  description: "Discover community events and educational programs hosted by masjids near you.",
};

export const revalidate = 3600; // Revalidate every hour

export default async function ProgramsPage() {
  const supabase = await createClient();

  // Fetch all programs joined with their hosting masjid
  // In a real app with thousands of programs, we'd paginate this or filter by location
  // But for now, we fetch all active programs.
  const { data: programs, error } = await (supabase as any)
    .from("programs")
    .select(`
      id,
      masjid_id,
      title,
      description,
      target_audience,
      masjids:masjid_id (
        id,
        name,
        city
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching programs:", error);
  }

  // Typecast to ensure it matches our Program interface. 
  // Supabase returns an array for joins unless specified differently, but for an x-to-one it returns an object.
  const formattedPrograms: Program[] = (programs || []).map((p: any) => ({
    ...p,
    // Safely handle if Supabase returns an array for the 1:1 join
    masjids: Array.isArray(p.masjids) ? p.masjids[0] : p.masjids
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <ProgramsListClient initialPrograms={formattedPrograms} />
    </div>
  );
}
