import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FacultyClientLayout from '@/components/layout/dashboards/FacultyClientLayout';

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login?redirect=/faculty');
  }

  // Fetch the user's assigned masjids
  const { data: faculty } = await (supabase as any).from('masjid_faculty')
    .select('masjid_id, role, masjids(name, gps_location)')
    .eq('user_id', user.id);

  const masjids = (faculty || []).map((f: any) => ({
    id: f.masjid_id,
    name: f.masjids?.name,
    gps_location: f.masjids?.gps_location,
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

  return (
    <FacultyClientLayout 
      masjids={masjids} 
      pendingClaims={pendingClaims} 
      userInitials={userInitials}
    >
      {children}
    </FacultyClientLayout>
  );
}
