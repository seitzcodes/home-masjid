import { createClient } from '@/lib/supabase/server';
import { Heart, Star, Settings } from 'lucide-react';
import Link from 'next/link';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await (supabase as any).from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {profile?.full_name || 'User'}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage your personal profile, donations, and followed masjids here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Links */}
        <Link href="/account/donations" className="block p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-[#D4AF37] hover:shadow-md transition-all group">
          <Heart className="w-8 h-8 text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">My Donations</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">View receipts and manage your recurring Sadaqah Jariyah.</p>
        </Link>

        <Link href="/account/following" className="block p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-[#D4AF37] hover:shadow-md transition-all group">
          <Star className="w-8 h-8 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Following</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage the masjids you follow and update your Home Masjid.</p>
        </Link>

        <Link href="/account/settings" className="block p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-[#D4AF37] hover:shadow-md transition-all group">
          <Settings className="w-8 h-8 text-slate-500 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Account Settings</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Update your email, password, and notification preferences.</p>
        </Link>
      </div>
    </div>
  );
}
