import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClientLayout from './DashboardClientLayout';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  // Fetch the user's assigned masjids
  const { data: faculty } = await (supabase as any).from('masjid_faculty')
    .select('masjid_id, role, masjids(name)')
    .eq('user_id', user.id);

  const masjids = (faculty || []).map((f: any) => ({
    id: f.masjid_id,
    name: f.masjids?.name,
    role: f.role
  }));

  // Fetch pending claims
  const { data: claims } = await (supabase as any).from('masjid_claims')
    .select('id, status, masjids(name)')
    .eq('user_id', user.id)
    .eq('status', 'pending');

  const pendingClaims = (claims || []).map((c: any) => ({
    id: c.id,
    masjidName: c.masjids?.name,
  }));

  const userInitials = user.email ? user.email[0].toUpperCase() : 'U';

  // Check if superadmin
  const { data: profile } = await (supabase as any).from('user_profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = profile?.is_superadmin ?? false;

  return (
    <DashboardClientLayout 
      masjids={masjids} 
      pendingClaims={pendingClaims} 
      userInitials={userInitials}
      isSuperAdmin={isSuperAdmin}
    >
      {children}
    </DashboardClientLayout>
  );
}
