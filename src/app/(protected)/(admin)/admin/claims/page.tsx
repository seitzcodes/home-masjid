import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck, FileText, CheckCircle, XCircle } from "lucide-react";
import { ClaimActions } from "./ClaimActions";

export const metadata = {
  title: "Admin Claims Review | Dashboard",
};

export default async function AdminClaimsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify the user is a superadmin
  const { data: profile } = await (supabase as any).from("user_profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) {
    return (
      <div className="w-full max-w-5xl mx-auto p-12 text-center bg-surface border border-border rounded-2xl">
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">This area is restricted to system administrators.</p>
      </div>
    );
  }

  // Fetch all pending claims
  const { data: pendingClaims } = await (supabase as any).from("masjid_claims")
    .select(`
      id,
      user_id,
      masjid_id,
      role_title,
      phone_number,
      proof_documents,
      status,
      created_at
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Get masjids and users
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
      .select("id, full_name, email")
      .in("id", userIds);
    profiles?.forEach((p: any) => usersMap[p.id] = p);
  }

  // Fetch vouches
  const claimIds = pendingClaims?.map((c: any) => c.id) || [];
  let vouchesMap: Record<string, any[]> = {};
  
  if (claimIds.length > 0) {
    const { data: vouches } = await (supabase as any).from("masjid_claim_vouches")
      .select("claim_id, vouching_user_id, created_at")
      .in("claim_id", claimIds);
      
    vouches?.forEach((v: any) => {
      if (!vouchesMap[v.claim_id]) vouchesMap[v.claim_id] = [];
      vouchesMap[v.claim_id].push(v);
    });
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-red-500" />
          Admin Claims Review
        </h1>
        <p className="mt-1 text-muted-foreground text-sm max-w-3xl">
          Review verification documents and community vouches to approve or reject pending masjid claims.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="divide-y divide-border">
          {!pendingClaims || pendingClaims.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-80" />
              <p className="text-lg font-medium text-foreground mb-1">All Caught Up!</p>
              <p>There are no pending claims to review.</p>
            </div>
          ) : (
            pendingClaims.map((claim: any) => {
              const masjid = masjidsMap[claim.masjid_id];
              const claimer = usersMap[claim.user_id];
              const vouches = vouchesMap[claim.id] || [];

              return (
                <div key={claim.id} className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-xl text-foreground">{masjid?.name || "Unknown Masjid"}</h3>
                          <p className="text-muted-foreground text-sm">{masjid?.city}, {masjid?.country} • {masjid?.address}</p>
                        </div>
                        {vouches.length > 0 && (
                          <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {vouches.length} {vouches.length === 1 ? 'Vouch' : 'Vouches'}
                          </div>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-border">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Claimer Name</p>
                          <p className="font-medium">{claimer?.full_name || "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Requested Role</p>
                          <p className="font-medium">{claim.role_title}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Phone Number</p>
                          <p className="font-medium font-mono">{claim.phone_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Submitted On</p>
                          <p className="font-medium">{new Date(claim.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Documents */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" /> 
                          Verification Documents ({claim.proof_documents?.length || 0})
                        </h4>
                        {claim.proof_documents && claim.proof_documents.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {claim.proof_documents.map((docPath: string, i: number) => {
                              // We use the storage bucket URL
                              const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/verification_documents/${docPath}`;
                              return (
                                <a 
                                  key={i} 
                                  href={url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors rounded-lg text-sm text-foreground"
                                >
                                  <FileText className="w-3.5 h-3.5" /> Document {i + 1}
                                </a>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No documents uploaded.</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full lg:w-72 shrink-0 bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-xl border border-border">
                      <h4 className="text-sm font-semibold mb-4 border-b border-border pb-2">Admin Actions</h4>
                      <ClaimActions claimId={claim.id} />
                    </div>
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
