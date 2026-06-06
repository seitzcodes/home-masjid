import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck, UserCheck, Search, MapPin } from "lucide-react";
import { VouchButton } from "./VouchButton";

export const metadata = {
  title: "Community Vouching | Dashboard",
};

export default async function CommunityVouchPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify the current user is faculty
  const { data: faculty } = await (supabase as any).from("masjid_faculty")
    .select("masjid_id")
    .eq("user_id", user.id)
    .single();

  if (!faculty) {
    return (
      <div className="w-full max-w-5xl mx-auto p-12 text-center bg-surface border border-border rounded-2xl">
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">Only verified faculty members can vouch for other masjids.</p>
      </div>
    );
  }

  // Fetch pending claims (excluding their own masjid)
  const { data: pendingClaims } = await (supabase as any).from("masjid_claims")
    .select(`
      id,
      user_id,
      role_title,
      created_at,
      masjid_id
    `)
    .eq("status", "pending")
    .neq("masjid_id", faculty.masjid_id)
    .order("created_at", { ascending: false });

  // Fetch details for the masjids and claimers manually since relations might not be setup properly in the types
  const masjidIds = pendingClaims?.map((c: any) => c.masjid_id) || [];
  const userIds = pendingClaims?.map((c: any) => c.user_id) || [];

  let masjidsMap: Record<string, any> = {};
  if (masjidIds.length > 0) {
    const { data: masjids } = await (supabase as any).from("masjids")
      .select("id, name, city, country, address")
      .in("id", masjidIds);
    masjids?.forEach((m: any) => masjidsMap[m.id] = m);
  }

  let usersMap: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await (supabase as any).from("user_profiles")
      .select("id, full_name")
      .in("id", userIds);
    profiles?.forEach((p: any) => usersMap[p.id] = p);
  }

  // Fetch vouches made by the CURRENT user, to see if they already vouched
  let vouchedClaimIds = new Set<string>();
  const { data: myVouches } = await (supabase as any).from("masjid_claim_vouches")
    .select("claim_id")
    .eq("vouching_user_id", user.id);
  
  if (myVouches) {
    myVouches.forEach((v: any) => vouchedClaimIds.add(v.claim_id));
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
          Peer Validation
        </h1>
        <p className="mt-1 text-muted-foreground text-sm max-w-3xl">
          Help maintain the integrity of Home Masjid. Review claims from other masjids in your community and vouch for them if you know the faculty members personally.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search masjids..." 
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="divide-y divide-border">
          {!pendingClaims || pendingClaims.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No pending claims in your area right now.</p>
            </div>
          ) : (
            pendingClaims.map((claim: any) => {
              const masjid = masjidsMap[claim.masjid_id];
              const claimer = usersMap[claim.user_id];
              const hasVouched = vouchedClaimIds.has(claim.id);

              return (
                <div key={claim.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{masjid?.name || "Unknown Masjid"}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {masjid?.city}, {masjid?.country}
                      </div>
                    </div>
                    
                    <div className="bg-background border border-border p-3 rounded-lg inline-flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Claimed By</p>
                        <p className="text-sm font-medium">{claimer?.full_name || "Unknown User"}</p>
                      </div>
                      <div className="w-px h-8 bg-border"></div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Role</p>
                        <p className="text-sm font-medium">{claim.role_title}</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-2">
                    {hasVouched ? (
                      <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-sm font-medium w-full md:w-auto justify-center">
                        <CheckCircle className="w-4 h-4" /> You vouched for this
                      </div>
                    ) : (
                      <VouchButton claimId={claim.id} masjidName={masjid?.name} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
