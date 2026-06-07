import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AccountClientLayout from '@/components/layout/dashboards/AccountClientLayout';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login?redirect=/account');
  }

  const { data: profile } = await (supabase as any).from('user_profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const userInitials = profile?.full_name ? profile.full_name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U');
  const userName = profile?.full_name || 'User';

  return (
    <AccountClientLayout userInitials={userInitials} userName={userName}>
      {children}
    </AccountClientLayout>
  );
}
