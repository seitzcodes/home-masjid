import { createClient } from '@/lib/supabase/server';
import { Calendar } from 'lucide-react';
import { createProgram, deleteProgram } from './actions';

export async function ProgramsTab({ masjidId }: { masjidId: string }) {
  const supabase = await createClient();
  const { data: programs } = await (supabase as any).from('programs')
    .select('*')
    .eq('masjid_id', masjidId)
    .order('start_time', { ascending: true });

  // Prebind masjidId to server actions
  const addProgram = createProgram.bind(null, masjidId);
  const removeProgram = deleteProgram.bind(null, masjidId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="col-span-1 md:col-span-2 space-y-4">
        {!programs || programs.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-border rounded-xl">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No events scheduled.</p>
          </div>
        ) : (
          programs.map((prog: any) => (
            <div key={prog.id} className="bg-surface p-5 rounded-xl border border-border shadow-sm flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-foreground">{prog.title}</h3>
                  {prog.target_audience && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                      {prog.target_audience}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-[#0F172A] dark:text-slate-300 mb-2">
                  {new Date(prog.start_time).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">{prog.description}</p>
              </div>
              <form action={removeProgram}>
                <input type="hidden" name="id" value={prog.id} />
                <button className="text-sm text-red-500 hover:underline">Delete</button>
              </form>
            </div>
          ))
        )}
      </div>

      <div className="col-span-1">
        <div className="bg-surface border border-border shadow-sm rounded-xl p-6 sticky top-24">
          <h2 className="font-semibold text-lg mb-4 text-foreground">Add Event</h2>
          <form action={addProgram} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Title</label>
              <input name="title" required className="w-full p-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-[#D4AF37] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Audience</label>
              <select name="target_audience" className="w-full p-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-[#D4AF37] outline-none" required>
                <option value="Families & General Public">Families & General Public</option>
                <option value="Youth & Children">Youth & Children</option>
                <option value="Women & Sisters">Women & Sisters</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Date & Time</label>
              <input type="datetime-local" name="start_time" required className="w-full p-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-[#D4AF37] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Description</label>
              <textarea name="description" rows={3} className="w-full p-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-[#D4AF37] outline-none" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg font-medium transition-colors">
              Save Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
