import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Calendar } from 'lucide-react';

export const metadata = { title: 'Programs | Dashboard' };

export default async function ProgramsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');

  const { data: faculty } = await (supabase.from('masjid_faculty') as any)
    .select('masjid_id')
    .eq('user_id', session.user.id)
    .limit(1)
    .single();

  if (!faculty) return null;

  const masjidId = faculty.masjid_id;

  const { data: programs } = await (supabase.from('programs') as any)
    .select('*')
    .eq('masjid_id', masjidId)
    .order('start_time', { ascending: true });

  async function createProgram(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const start_time = formData.get('start_time') as string;
    const target_audience = formData.get('target_audience') as string;
    
    const supabase = await createClient();
    
    await (supabase.from('programs') as any).insert({
      masjid_id: masjidId,
      title,
      description,
      start_time: new Date(start_time).toISOString(),
      target_audience,
    });
    
    revalidatePath('/dashboard/programs');
  }

  async function deleteProgram(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabase = await createClient();
    await (supabase.from('programs') as any).delete().eq('id', id).eq('masjid_id', masjidId);
    revalidatePath('/dashboard/programs');
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-muted-foreground">Manage events and programs at your masjid.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-4">
          {!programs || programs.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-border rounded-xl">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No programs scheduled.</p>
            </div>
          ) : (
            programs.map((prog: any) => (
              <div key={prog.id} className="bg-surface p-5 rounded-xl border border-border shadow-sm flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{prog.title}</h3>
                    {prog.target_audience && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-accent border border-accent/20">
                        {prog.target_audience}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-primary mb-2">
                    {new Date(prog.start_time).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{prog.description}</p>
                </div>
                <form action={deleteProgram}>
                  <input type="hidden" name="id" value={prog.id} />
                  <button className="text-sm text-red-500 hover:underline">Delete</button>
                </form>
              </div>
            ))
          )}
        </div>

        <div className="col-span-1">
          <div className="bg-surface border border-border shadow-sm rounded-xl p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Add Program</h2>
            <form action={createProgram} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input name="title" required className="w-full p-2 bg-background border border-border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience</label>
                <select name="target_audience" className="w-full p-2 bg-background border border-border rounded-lg" required>
                  <option value="Families & General Public">Families & General Public</option>
                  <option value="Youth & Children">Youth & Children</option>
                  <option value="Women & Sisters">Women & Sisters</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input type="datetime-local" name="start_time" required className="w-full p-2 bg-background border border-border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" rows={3} className="w-full p-2 bg-background border border-border rounded-lg" />
              </div>
              <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-light">
                Add Program
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
