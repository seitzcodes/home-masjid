import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ShieldAlert, Check, X, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const metadata = { title: 'Moderation | Dashboard' };

export default async function ModerationPage() {
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

  // Fetch pending reports
  const { data: reports } = await (supabase as any).from('content_reports')
    .select(`
      *,
      reporter:user_profiles!reporter_id(full_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  async function dismissReport(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabase = await createClient();
    await (supabase as any).from('content_reports').update({ status: 'dismissed' }).eq('id', id);
    revalidatePath('/dashboard/moderation');
  }

  async function deleteContent(formData: FormData) {
    'use server';
    const reportId = formData.get('report_id') as string;
    const targetId = formData.get('target_id') as string;
    const targetType = formData.get('target_type') as string;
    
    const supabase = await createClient();
    
    if (targetType === 'post') {
      await (supabase as any).from('posts').delete().eq('id', targetId);
    } else if (targetType === 'comment') {
      await (supabase as any).from('comments').delete().eq('id', targetId);
    }
    
    // Mark as reviewed
    await (supabase as any).from('content_reports').update({ status: 'reviewed' }).eq('id', reportId);
    revalidatePath('/dashboard/moderation');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-orange-500" /> Content Moderation
        </h1>
        <p className="text-muted-foreground mt-1">Review user reports and manage flagged content across the platform.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-semibold text-foreground">Pending Reports Queue</h2>
        </div>
        
        <div className="divide-y divide-border">
          {!reports || reports.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Check className="w-8 h-8 mx-auto mb-3 text-green-500 opacity-50" />
              <p>The queue is empty. All clear!</p>
            </div>
          ) : (
            reports.map((report: any) => (
              <div key={report.id} className="p-5 flex flex-col md:flex-row gap-6 hover:bg-muted/30 transition-colors">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 uppercase tracking-wide">
                      {report.target_type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Reported by {report.reporter?.full_name || 'User'} on {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Reason:</h4>
                    <p className="text-slate-700 bg-white border border-slate-200 p-3 rounded-lg mt-1 text-sm">
                      {report.reason}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Target ID: {report.target_id}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 justify-end md:justify-start min-w-[140px]">
                  <form action={deleteContent} className="w-full">
                    <input type="hidden" name="report_id" value={report.id} />
                    <input type="hidden" name="target_id" value={report.target_id} />
                    <input type="hidden" name="target_type" value={report.target_type} />
                    <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete Content
                    </button>
                  </form>
                  <form action={dismissReport} className="w-full">
                    <input type="hidden" name="id" value={report.id} />
                    <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium transition-colors">
                      <X className="w-4 h-4" /> Dismiss Report
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
