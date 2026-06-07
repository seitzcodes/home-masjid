import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Calendar, Clock, Moon } from 'lucide-react';
import Link from 'next/link';
import { ProgramsTab } from './ProgramsTab';
import { JumuahTab } from './JumuahTab';
import { RamadanTab } from './RamadanTab';

export const metadata = { title: 'Programs | Dashboard' };

export default async function ProgramsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = 'events' } = await searchParams;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: faculty } = await (supabase as any).from('masjid_faculty')
    .select('masjid_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!faculty) return null;
  const masjidId = faculty.masjid_id;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Programs & Schedules</h1>
          <p className="text-muted-foreground">Manage events, Jumu'ah times, and Ramadan specifics.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border">
        <Link 
          href="/dashboard/programs?tab=events" 
          className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${tab === 'events' ? 'border-[#D4AF37] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Calendar className="w-4 h-4" /> Events
        </Link>
        <Link 
          href="/dashboard/programs?tab=jumuah" 
          className={`pb-3 px-1 ml-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${tab === 'jumuah' ? 'border-[#D4AF37] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Clock className="w-4 h-4" /> Jumu'ah
        </Link>
        <Link 
          href="/dashboard/programs?tab=ramadan" 
          className={`pb-3 px-1 ml-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${tab === 'ramadan' ? 'border-[#D4AF37] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Moon className="w-4 h-4" /> Ramadan
        </Link>
      </div>

      <div className="pt-2">
        {tab === 'events' && <ProgramsTab masjidId={masjidId} />}
        {tab === 'jumuah' && <JumuahTab masjidId={masjidId} />}
        {tab === 'ramadan' && <RamadanTab masjidId={masjidId} />}
      </div>
    </div>
  );
}
