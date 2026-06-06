import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { FileText } from 'lucide-react';

export const metadata = { title: 'Posts | Dashboard' };

export default async function PostsPage() {
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

  const { data: posts } = await (supabase.from('posts') as any)
    .select('*')
    .eq('masjid_id', masjidId)
    .order('created_at', { ascending: false });

  async function createPost(formData: FormData) {
    'use server';
    const content = formData.get('content') as string;
    
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await (supabase.from('posts') as any).insert({
        masjid_id: masjidId,
        author_id: session.user.id,
        content,
      });
      revalidatePath('/dashboard/posts');
    }
  }

  async function deletePost(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabase = await createClient();
    await (supabase.from('posts') as any).delete().eq('id', id).eq('masjid_id', masjidId);
    revalidatePath('/dashboard/posts');
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Community Feed & Inbox</h1>
          <p className="text-muted-foreground">Post official updates and manage public comments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-4">
          {!posts || posts.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-border rounded-xl">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No posts yet.</p>
            </div>
          ) : (
            posts.map((post: any) => (
              <div key={post.id} className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                  <form action={deletePost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button className="text-xs text-red-500 hover:underline">Delete</button>
                  </form>
                </div>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="col-span-1">
          <div className="bg-surface border border-border shadow-sm rounded-xl p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Create Post</h2>
            <form action={createPost} className="space-y-4">
              <div>
                <textarea 
                  name="content" 
                  required 
                  rows={6}
                  placeholder="What's happening at the masjid? (Markdown supported)"
                  className="w-full p-3 bg-background border border-border rounded-lg resize-none font-mono text-sm" 
                />
              </div>
              <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-light font-medium transition-colors">
                Publish Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
