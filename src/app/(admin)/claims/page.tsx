import React from "react";
import { createClient } from "@/lib/supabase/server";
import { approveClaim, rejectClaim } from "./actions";
import { Check, X, FileText, Phone, Building2 } from "lucide-react";
import Link from "next/link";

export default async function AdminClaimsPage() {
  const supabase = await createClient();

  // Fetch all pending claims with associated user and masjid details
  // Note: user_profiles joining requires a foreign key relation, which we have
  const { data: claims, error } = await (supabase as any).from("masjid_claims")
    .select(`
      id,
      role_title,
      phone_number,
      proof_documents,
      created_at,
      status,
      masjids ( id, name, city ),
      user_profiles ( id, full_name )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching claims:", error);
  }

  // Pre-fetch signed URLs for all documents
  const allPaths: string[] = [];
  claims?.forEach((c: any) => {
    if (Array.isArray(c.proof_documents)) {
      allPaths.push(...c.proof_documents);
    } else if (typeof c.proof_documents === "string" && c.proof_documents.trim() !== "") {
      allPaths.push(c.proof_documents);
    }
  });

  const signedUrlsMap: Record<string, string> = {};
  if (allPaths.length > 0) {
    const { data: urlsData } = await supabase.storage
      .from('verification_documents')
      .createSignedUrls(allPaths, 60 * 60); // 1 hour validity

    if (urlsData) {
      urlsData.forEach((item) => {
        if (!item.error && item.signedUrl && item.path) {
          signedUrlsMap[item.path] = item.signedUrl;
        }
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verification Queue</h2>
        <p className="text-slate-500">Review and manage pending masjid claim requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {!claims || claims.length === 0 ? (
          <div className="rounded-xl border border-dashed border-2 border-slate-200 bg-slate-50/50">
            <div className="p-6 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
              <p className="text-slate-500">There are no pending claims to review right now.</p>
            </div>
          </div>
        ) : (
          claims.map((claim: any) => (
            <div key={claim.id} className="rounded-xl border bg-white overflow-hidden border-slate-200 shadow-sm">
              <div className="md:flex">
                {/* Info Section */}
                <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200">
                      Pending Review
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                        <Building2 className="w-4 h-4" />
                        Masjid Requested
                      </div>
                      <h3 className="text-xl font-bold text-[#0F172A]">
                        {claim.masjids?.name || "Unknown Masjid"}
                      </h3>
                      <p className="text-sm text-slate-500">{claim.masjids?.city}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Applicant</p>
                        <p className="font-medium text-slate-900">{claim.user_profiles?.full_name || "Unknown User"}</p>
                        <p className="text-sm text-slate-600">{claim.role_title}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Contact</p>
                        <div className="flex items-center gap-1.5 text-slate-900">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm">{claim.phone_number}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                <div className="p-6 md:w-80 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Verification Documents</p>
                    {(() => {
                      const docs = Array.isArray(claim.proof_documents) 
                        ? claim.proof_documents 
                        : (claim.proof_documents ? [claim.proof_documents] : []);
                      
                      return docs.length > 0 ? (
                        <div className="space-y-2">
                          {docs.map((docPath: string, idx: number) => (
                            <Link 
                              key={idx}
                              href={signedUrlsMap[docPath] || '#'} 
                              target="_blank"
                              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group"
                            >
                              <div className="bg-slate-100 p-2 rounded-md group-hover:bg-slate-200 transition-colors">
                                <FileText className="w-4 h-4 text-slate-600" />
                              </div>
                              <div className="truncate">
                                <p className="text-sm font-medium text-[#0F172A] truncate">Document {idx + 1}</p>
                                <p className="text-xs text-slate-500">Opens securely</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-500 italic">
                          No documents provided
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <form action={async () => {
                      "use server";
                      await rejectClaim(claim.id);
                    }} className="flex-1">
                      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border bg-transparent w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-4 py-2">
                        <X className="w-4 h-4 mr-1.5" /> Reject
                      </button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await approveClaim(claim.id);
                    }} className="flex-1">
                      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium w-full bg-[#16A34A] hover:bg-[#15803D] text-white h-10 px-4 py-2">
                        <Check className="w-4 h-4 mr-1.5" /> Approve
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
