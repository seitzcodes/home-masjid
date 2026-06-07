import { createClient } from '@/lib/supabase/server';
import { Clock } from 'lucide-react';
import { createJumuah, deleteJumuah } from './actions';

export async function JumuahTab({ masjidId }: { masjidId: string }) {
  const supabase = await createClient();
  const { data: schedules } = await (supabase as any).from('jumuah_schedules')
    .select('*')
    .eq('masjid_id', masjidId)
    .order('khutbah_time', { ascending: true });

  const addJumuah = createJumuah.bind(null, masjidId);
  const removeJumuah = deleteJumuah.bind(null, masjidId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="col-span-1 md:col-span-2 space-y-4">
        {!schedules || schedules.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-border rounded-xl">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No Jumu'ah times set.</p>
          </div>
        ) : (
          schedules.map((schedule: any) => (
            <div key={schedule.id} className="bg-surface p-5 rounded-xl border border-border shadow-sm flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-foreground">
                    {schedule.khutbah_time.substring(0, 5)} Khutbah
                  </h3>
                  {schedule.is_active && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                      Active
                    </span>
                  )}
                </div>
                {schedule.speaker_name && (
                  <p className="text-sm font-medium text-[#0F172A] dark:text-slate-300 mb-1">
                    Khatib: {schedule.speaker_name}
                  </p>
                )}
                {schedule.topic && (
                  <p className="text-sm text-muted-foreground">Topic: {schedule.topic}</p>
                )}
              </div>
              <form action={removeJumuah}>
                <input type="hidden" name="id" value={schedule.id} />
                <button className="text-sm text-red-500 hover:underline">Delete</button>
              </form>
            </div>
          ))
        )}
      </div>

      <div className="col-span-1">
        <div className="bg-surface border border-border shadow-sm rounded-xl p-6 sticky top-24">
          <h2 className="font-semibold text-lg mb-4 text-foreground">Add Jumu'ah</h2>
          <form action={addJumuah} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Khutbah Time</label>
              <input type="time" name="khutbah_time" required className="w-full p-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-[#D4AF37] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Khatib (Optional)</label>
              <input name="speaker_name" placeholder="e.g. Sheikh Abdullah" className="w-full p-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-[#D4AF37] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Topic (Optional)</label>
              <input name="topic" placeholder="e.g. Tafseer Surah Al-Kahf" className="w-full p-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-[#D4AF37] outline-none" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg font-medium transition-colors">
              Save Jumu'ah
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
