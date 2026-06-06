import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const metadata = { title: 'Settings | Dashboard' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  // Fetch the user's first masjid to manage
  const { data: faculty } = await (supabase as any).from('masjid_faculty')
    .select('masjid_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!faculty) {
    return null; // Layout handles empty state
  }

  const masjidId = faculty.masjid_id;

  const { data: masjid } = await (supabase as any).from('masjids')
    .select('*')
    .eq('id', masjidId)
    .single();

  async function updateProfile(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const fajr = formData.get('fajr_iqama') as string;
    const dhuhr = formData.get('dhuhr_iqama') as string;
    const asr = formData.get('asr_iqama') as string;
    const maghrib = formData.get('maghrib_iqama') as string;
    const isha = formData.get('isha_iqama') as string;
    const jumuah = formData.get('jumuah_time') as string;

    const iqama_times = { fajr, dhuhr, asr, maghrib, isha, jumuah };
    
    // In a real app we'd verify faculty status again here before updating
    await (supabase as any).from('masjids').update({
      name,
      description,
      address,
      iqama_times
    }).eq('id', masjidId);
    
    revalidatePath('/dashboard/settings');
    revalidatePath(`/masjids/${masjidId}`);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Masjid Settings</h1>
        <p className="text-muted-foreground">Manage your public profile information.</p>
      </div>

      <div className="bg-surface border border-border shadow-sm rounded-xl p-6">
        <form action={updateProfile} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Masjid Name</label>
            <input 
              id="name"
              name="name"
              defaultValue={masjid?.name}
              className="w-full p-2 bg-background border border-border rounded-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea 
              id="description"
              name="description"
              defaultValue={masjid?.description || ''}
              className="w-full p-2 bg-background border border-border rounded-lg"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">Street Address</label>
            <input 
              id="address"
              name="address"
              defaultValue={masjid?.address}
              className="w-full p-2 bg-background border border-border rounded-lg"
            />
          </div>

          <div className="pt-6 border-t border-border mt-6">
            <h2 className="text-lg font-semibold mb-4 text-accent">Prayer Times Override (Iqama)</h2>
            <p className="text-sm text-muted-foreground mb-4">Set local congregation times to override the calculated Adhan times.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fajr Iqama</label>
                <input type="time" name="fajr_iqama" defaultValue={masjid?.iqama_times?.fajr || ''} className="w-full p-2 bg-background border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dhuhr Iqama</label>
                <input type="time" name="dhuhr_iqama" defaultValue={masjid?.iqama_times?.dhuhr || ''} className="w-full p-2 bg-background border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Asr Iqama</label>
                <input type="time" name="asr_iqama" defaultValue={masjid?.iqama_times?.asr || ''} className="w-full p-2 bg-background border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maghrib Iqama</label>
                <input type="time" name="maghrib_iqama" defaultValue={masjid?.iqama_times?.maghrib || ''} className="w-full p-2 bg-background border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Isha Iqama</label>
                <input type="time" name="isha_iqama" defaultValue={masjid?.iqama_times?.isha || ''} className="w-full p-2 bg-background border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jumu'ah Time</label>
                <input type="time" name="jumuah_time" defaultValue={masjid?.iqama_times?.jumuah || ''} className="w-full p-2 bg-background border border-border rounded-lg" />
              </div>
            </div>
          </div>

          <button type="submit" className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-light">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
