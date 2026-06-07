import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminClientLayout from '@/components/layout/dashboards/AdminClientLayout';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Check if superadmin
  const { data: profile } = await (supabase as any).from('user_profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = profile?.is_superadmin ?? false;

  if (!isSuperAdmin) {
    // If not admin, push to regular dashboard or home
    redirect('/faculty');
  }

  const userInitials = user.email ? user.email[0].toUpperCase() : 'A';

  return (
    <AdminClientLayout userInitials={userInitials}>
      {children}
    </AdminClientLayout>
  );
}
