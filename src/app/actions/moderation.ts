'use server';

import { createClient } from '@/lib/supabase/server';

export async function submitContentReport(targetId: string, targetType: 'post' | 'comment' | 'masjid' | 'user', reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'You must be logged in to report content.' };

  const { error } = await (supabase as any).from('content_reports').insert({
    reporter_id: user.id,
    target_id: targetId,
    target_type: targetType,
    reason: reason,
    status: 'pending'
  });

  if (error) {
    console.error('Error submitting report:', error);
    return { error: 'Failed to submit report. Please try again.' };
  }

  return { success: true };
}
