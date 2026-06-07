'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Programs
export async function createProgram(masjidId: string, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const start_time = formData.get('start_time') as string;
  const target_audience = formData.get('target_audience') as string;
  
  const supabase = await createClient();
  
  await (supabase as any).from('programs').insert({
    masjid_id: masjidId,
    title,
    description,
    start_time: new Date(start_time).toISOString(),
    target_audience,
  });
  
  revalidatePath('/dashboard/programs');
}

export async function deleteProgram(masjidId: string, formData: FormData) {
  const id = formData.get('id') as string;
  const supabase = await createClient();
  await (supabase as any).from('programs').delete().eq('id', id).eq('masjid_id', masjidId);
  revalidatePath('/dashboard/programs');
}

// Jumu'ah
export async function createJumuah(masjidId: string, formData: FormData) {
  const khutbah_time = formData.get('khutbah_time') as string;
  const speaker_name = formData.get('speaker_name') as string;
  const topic = formData.get('topic') as string;
  
  const supabase = await createClient();
  
  await (supabase as any).from('jumuah_schedules').insert({
    masjid_id: masjidId,
    khutbah_time,
    speaker_name: speaker_name || null,
    topic: topic || null,
  });
  
  revalidatePath('/dashboard/programs');
}

export async function deleteJumuah(masjidId: string, formData: FormData) {
  const id = formData.get('id') as string;
  const supabase = await createClient();
  await (supabase as any).from('jumuah_schedules').delete().eq('id', id).eq('masjid_id', masjidId);
  revalidatePath('/dashboard/programs');
}

// Ramadan
export async function saveRamadan(masjidId: string, hijriYear: number, formData: FormData) {
  const taraweeh_time = formData.get('taraweeh_time') as string;
  const iftar_provided = formData.get('iftar_provided') === 'on';
  const itikaf_available = formData.get('itikaf_available') === 'on';
  
  const supabase = await createClient();
  
  // Upsert pattern
  const { data: existing } = await (supabase as any).from('ramadan_schedules')
    .select('id')
    .eq('masjid_id', masjidId)
    .eq('hijri_year', hijriYear)
    .maybeSingle();

  if (existing) {
    await (supabase as any).from('ramadan_schedules')
      .update({
        taraweeh_time: taraweeh_time || null,
        iftar_provided,
        itikaf_available
      })
      .eq('id', existing.id);
  } else {
    await (supabase as any).from('ramadan_schedules')
      .insert({
        masjid_id: masjidId,
        hijri_year: hijriYear,
        taraweeh_time: taraweeh_time || null,
        iftar_provided,
        itikaf_available
      });
  }
  
  revalidatePath('/dashboard/programs');
}
