import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClientLayout from './DashboardClientLayout';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login?redirect=/dashboard');
  }

  // Fetch the user's assigned masjids
  const { data: faculty } = await (supabase.from('masjid_faculty') as any)
    .select('masjid_id, role, masjids(name)')
    .eq('user_id', session.user.id);

  const masjids = (faculty || []).map((f: any) => ({
    id: f.masjid_id,
    name: f.masjids?.name,
    role: f.role
  }));

  // Fetch pending claims
  const { data: claims } = await (supabase.from('masjid_claims') as any)
    .select('id, status, masjids(name)')
    .eq('user_id', session.user.id)
    .eq('status', 'pending');

  const pendingClaims = (claims || []).map((c: any) => ({
    id: c.id,
    masjidName: c.masjids?.name,
  }));

  const userInitials = session.user.email ? session.user.email[0].toUpperCase() : 'U';

  return (
    <DashboardClientLayout masjids={masjids} pendingClaims={pendingClaims} userInitials={userInitials}>
      {children}
    </DashboardClientLayout>
  );
}
