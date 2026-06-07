import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BarChart3, Building2, Users, CreditCard, Clock } from 'lucide-react';

export const metadata = { title: 'Analytics | Dashboard' };

export const revalidate = 600; // Cache for 10 minutes

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: profile } = await (supabase as any).from('user_profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_superadmin) {
    redirect('/dashboard');
  }

  // Execute aggregated queries
  // 1. Total Masjids
  const { count: totalMasjids } = await (supabase as any).from('masjids')
    .select('id', { count: 'exact', head: true })
    .eq('is_verified', true);

  // 2. Total Users
  const { count: totalUsers } = await (supabase as any).from('user_profiles')
    .select('id', { count: 'exact', head: true });

  // 3. Pending Claims
  const { count: pendingClaims } = await (supabase as any).from('masjid_claims')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 4. Total Donations (aggregate using RPC or just sum client-side if small, but let's do a simple sum for MVP)
  // For production with thousands of rows, you'd use a postgres function. 
  // Here we'll fetch completed donations and sum them.
  const { data: donations } = await (supabase as any).from('donations')
    .select('amount')
    .eq('payment_status', 'completed');
  
  const totalDonations = donations ? donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-500" /> Platform Analytics
        </h1>
        <p className="text-muted-foreground mt-1">High-level insights across the entire Home Masjid ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Verified Masjids</p>
          <p className="text-3xl font-bold text-foreground">{totalMasjids || 0}</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Active Users</p>
          <p className="text-3xl font-bold text-foreground">{totalUsers || 0}</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total ZAR Processed</p>
          <p className="text-3xl font-bold text-foreground">R {totalDonations.toLocaleString()}</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Pending Claims</p>
          <p className="text-3xl font-bold text-foreground">{pendingClaims || 0}</p>
        </div>
      </div>

      <div className="bg-muted/30 border border-border rounded-xl p-8 text-center text-muted-foreground mt-8">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-foreground mb-2">More metrics coming soon</h3>
        <p>In Phase 8, we will introduce detailed growth charts, user engagement tracking, and donation heatmaps.</p>
      </div>
    </div>
  );
}
