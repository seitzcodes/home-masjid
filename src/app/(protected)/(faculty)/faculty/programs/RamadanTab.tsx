import { createClient } from '@/lib/supabase/server';
import { Moon } from 'lucide-react';
import { saveRamadan } from './actions';

export async function RamadanTab({ masjidId }: { masjidId: string }) {
  const supabase = await createClient();
  const currentHijriYear = 1447; // Default to upcoming Ramadan, ideally calculated dynamically

  const { data: schedule } = await (supabase as any).from('ramadan_schedules')
    .select('*')
    .eq('masjid_id', masjidId)
    .eq('hijri_year', currentHijriYear)
    .maybeSingle();

  const updateRamadan = saveRamadan.bind(null, masjidId, currentHijriYear);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="col-span-1 md:col-span-2 space-y-4">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Ramadan {currentHijriYear}</h2>
              <p className="text-sm text-muted-foreground">Configure your masjid's schedule for the holy month.</p>
            </div>
          </div>

          <form action={updateRamadan} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Taraweeh Time</label>
                <input 
                  type="time" 
                  name="taraweeh_time" 
                  defaultValue={schedule?.taraweeh_time?.substring(0, 5) || ''} 
                  className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                />
                <p className="text-xs text-muted-foreground mt-1">Leave blank if dependent on Isha jamaat.</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  name="iftar_provided" 
                  defaultChecked={schedule?.iftar_provided}
                  className="w-4 h-4 text-[#D4AF37] border-border rounded focus:ring-[#D4AF37]" 
                />
                <div>
                  <div className="font-medium text-foreground text-sm">Community Iftar Provided</div>
                  <div className="text-xs text-muted-foreground">Check this if your masjid provides daily public iftar.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  name="itikaf_available" 
                  defaultChecked={schedule?.itikaf_available}
                  className="w-4 h-4 text-[#D4AF37] border-border rounded focus:ring-[#D4AF37]" 
                />
                <div>
                  <div className="font-medium text-foreground text-sm">I'tikaf Facilities Available</div>
                  <div className="text-xs text-muted-foreground">Check this if your masjid accommodates brothers/sisters for I'tikaf in the last 10 days.</div>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-border">
              <button type="submit" className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg font-medium transition-colors">
                Save Ramadan Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="col-span-1">
        <div className="bg-muted/50 border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-2">Ramadan Visibility</h3>
          <p className="text-sm text-muted-foreground mb-4">
            These settings will automatically appear on your masjid's public profile as Ramadan approaches, providing the community with vital information.
          </p>
        </div>
      </div>
    </div>
  );
}
