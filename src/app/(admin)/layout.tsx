import { ReactNode } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Shield, Home, LayoutDashboard, Flag } from 'lucide-react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/admin/claims');
  }

  // Check if user is admin
  const { data: profile } = await (supabase.from('user_profiles') as any)
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center text-xl font-bold text-gradient-primary">
            <Home className="mr-2 h-5 w-5" />
            Admin Panel
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link 
            href="/admin/claims" 
            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary"
          >
            <Shield className="mr-3 h-5 w-5" />
            Masjid Claims
          </Link>
          <Link 
            href="/admin/reports" 
            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Flag className="mr-3 h-5 w-5" />
            Reports
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border">
          <Link 
            href="/dashboard" 
            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="md:hidden border-b border-border p-4 flex items-center justify-between bg-surface">
          <div className="font-bold">Admin Panel</div>
          <Link href="/dashboard" className="text-sm text-primary">Exit</Link>
        </div>
        {children}
      </main>
    </div>
  );
}
