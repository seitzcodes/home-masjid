import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Users, Shield, User } from 'lucide-react';

export const metadata = { title: 'Faculty | Dashboard' };

export default async function FacultyPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');

  const { data: currentFaculty } = await (supabase.from('masjid_faculty') as any)
    .select('masjid_id, role')
    .eq('user_id', session.user.id)
    .limit(1)
    .single();

  if (!currentFaculty) return null;

  const masjidId = currentFaculty.masjid_id;

  const { data: allFaculty } = await (supabase.from('masjid_faculty') as any)
    .select(`
      role,
      user_id,
      user_profiles:user_profiles!user_id(full_name)
    `)
    .eq('masjid_id', masjidId);

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground">Manage who has access to this masjid's dashboard.</p>
        </div>
      </div>

      <div className="bg-surface border border-border shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!allFaculty || allFaculty.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">
                  No faculty found.
                </td>
              </tr>
            ) : (
              allFaculty.map((f: any) => (
                <tr key={f.user_id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 font-bold">
                      {f.user_profiles?.full_name?.charAt(0) || 'U'}
                    </div>
                    {f.user_profiles?.full_name || 'Unknown User'}
                    {f.user_id === session.user.id && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                  </td>
                  <td className="px-6 py-4">
                    {f.role === 'admin' ? (
                      <span className="flex items-center text-success"><Shield className="w-4 h-4 mr-1"/> Admin</span>
                    ) : (
                      <span className="flex items-center text-muted-foreground"><User className="w-4 h-4 mr-1"/> Editor</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
        <p><strong>Note:</strong> Currently, adding new faculty members requires them to submit a claim through the public page and be approved by an administrator. In-dashboard invitations are coming soon.</p>
      </div>
    </div>
  );
}
