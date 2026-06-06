import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ShieldCheck, XCircle, Clock } from 'lucide-react';
import { sendClaimApprovalEmail, sendClaimRejectionEmail } from '@/lib/mail/resend';

export const metadata = { title: 'Admin - Claims | Home Masjid' };

export default async function AdminClaimsPage() {
  const supabase = await createClient();

  // Fetch claims with masjid and user details
  const { data: claims, error } = await (supabase.from('masjid_claims') as any)
    .select(`
      id,
      status,
      role_title,
      phone_number,
      created_at,
      user_id,
      masjid_id,
      masjids:masjids(name),
      user_profiles:user_profiles!user_id(full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching claims:', error);
  }

  // Define Server Actions inline (can also be extracted to a separate file)
  async function approveClaim(formData: FormData) {
    'use server';
    const claimId = formData.get('claimId') as string;
    const masjidId = formData.get('masjidId') as string;
    const userId = formData.get('userId') as string;
    const masjidName = formData.get('masjidName') as string;
    
    const supabase = await createClient();
    
    // 1. Update claim status
    // 1. Update claim status
    await (supabase.from('masjid_claims') as any).update({ status: 'approved' }).eq('id', claimId);
    
    // 2. Add to masjid_faculty
    // 2. Add to masjid_faculty
    await (supabase.from('masjid_faculty') as any).insert({
      masjid_id: masjidId,
      user_id: userId,
      role: 'admin'
    });
    
    // 3. Mark masjid as verified
    await (supabase.from('masjids') as any).update({ is_verified: true }).eq('id', masjidId);
    
    // 4. Send Email Notification
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    if (userData?.user?.email) {
      await sendClaimApprovalEmail(userData.user.email, masjidName);
    }
    
    revalidatePath('/admin/claims');
  }

  async function rejectClaim(formData: FormData) {
    'use server';
    const claimId = formData.get('claimId') as string;
    const userId = formData.get('userId') as string;
    const masjidName = formData.get('masjidName') as string;
    
    const supabase = await createClient();
    await (supabase.from('masjid_claims') as any).update({ status: 'rejected' }).eq('id', claimId);
    
    // Send Email Notification
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    if (userData?.user?.email) {
      await sendClaimRejectionEmail(userData.user.email, masjidName);
    }
    
    revalidatePath('/admin/claims');
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Masjid Claims Queue</h1>
        <p className="text-muted-foreground mt-1">Review and process verification requests from masjid faculty.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Masjid</th>
                <th className="px-6 py-4 font-medium">Applicant</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!claims || claims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No claims found.
                  </td>
                </tr>
              ) : (
                claims.map((claim: any) => (
                  <tr key={claim.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {claim.masjids?.name}
                    </td>
                    <td className="px-6 py-4">
                      {claim.user_profiles?.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                        {claim.role_title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {claim.phone_number || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {claim.status === 'pending' && (
                        <span className="flex items-center text-yellow-600 dark:text-yellow-500">
                          <Clock className="w-4 h-4 mr-1" /> Pending
                        </span>
                      )}
                      {claim.status === 'approved' && (
                        <span className="flex items-center text-success">
                          <ShieldCheck className="w-4 h-4 mr-1" /> Approved
                        </span>
                      )}
                      {claim.status === 'rejected' && (
                        <span className="flex items-center text-red-500">
                          <XCircle className="w-4 h-4 mr-1" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {claim.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <form action={approveClaim}>
                            <input type="hidden" name="claimId" value={claim.id} />
                            <input type="hidden" name="masjidId" value={claim.masjid_id} />
                            <input type="hidden" name="userId" value={claim.user_id} />
                            <input type="hidden" name="masjidName" value={claim.masjids?.name} />
                            <button className="px-3 py-1.5 bg-success text-white rounded-md text-xs font-medium hover:bg-success/90 transition-colors">
                              Approve
                            </button>
                          </form>
                          <form action={rejectClaim}>
                            <input type="hidden" name="claimId" value={claim.id} />
                            <input type="hidden" name="userId" value={claim.user_id} />
                            <input type="hidden" name="masjidName" value={claim.masjids?.name} />
                            <button className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 transition-colors">
                              Reject
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
