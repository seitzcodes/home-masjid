"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  FolderKanban,
  MessageSquare,
  Settings,
  Menu,
  X,
  ChevronDown,
  Users,
  ShieldCheck
} from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, id: "sidebar-overview" },
  { href: "/dashboard/programs", label: "Programs", icon: Calendar, id: "sidebar-programs" },
  { href: "/dashboard/posts", label: "Posts", icon: FileText, id: "sidebar-posts" },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban, id: "sidebar-projects" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, id: "sidebar-messages" },
  { href: "/dashboard/faculty", label: "Faculty", icon: Users, id: "sidebar-faculty" },
  { href: "/dashboard/community/vouch", label: "Peer Validation", icon: ShieldCheck, id: "sidebar-vouch" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, id: "sidebar-settings" },
];

interface MasjidContext {
  id: string;
  name: string;
  role: string;
}

interface ClaimContext {
  id: string;
  masjidName: string;
}

export default function DashboardClientLayout({
  children,
  masjids,
  pendingClaims,
  userInitials,
  isSuperAdmin
}: {
  children: React.ReactNode;
  masjids: MasjidContext[];
  pendingClaims: ClaimContext[];
  userInitials: string;
  isSuperAdmin?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // If user has no masjids, they shouldn't see the normal dashboard tools
  const hasMasjids = masjids.length > 0;
  const activeMasjid = hasMasjids ? masjids[0] : null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <Link
            href="/dashboard"
            id="sidebar-logo"
            className="text-lg font-bold text-accent"
          >
            Home Masjid
          </Link>
          <button
            id="sidebar-close"
            type="button"
            className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {hasMasjids ? (
          <nav className="mt-4 px-3 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  id={item.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-accent/20 text-accent" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            {isSuperAdmin && (
              <>
                <div className="pt-4 pb-2 px-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</p>
                </div>
                <Link
                  href="/dashboard/claims"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/dashboard/claims")
                      ? "bg-red-500/10 text-red-400"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <ShieldCheck className="h-5 w-5" />
                  Review Claims
                </Link>
              </>
            )}
          </nav>
        ) : (
          <div className="p-4 text-sm text-slate-400">
            You do not manage any masjids yet.
          </div>
        )}
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              id="sidebar-open"
              type="button"
              className="lg:hidden rounded-lg p-2 text-muted-foreground hover:bg-surface-hover"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {hasMasjids ? (
              <div className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 rounded-md transition-colors">
                <span className="font-semibold">{activeMasjid?.name}</span>
                {masjids.length > 1 && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            ) : (
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
              View Site
            </Link>
            <div
              id="dashboard-user-avatar"
              className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary"
            >
              {userInitials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {hasMasjids ? (
            children
          ) : pendingClaims && pendingClaims.length > 0 ? (
            <div className="text-center py-20 animate-fade-up max-w-lg mx-auto">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent mx-auto">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Verification Pending</h2>
              <p className="text-muted-foreground mb-6">
                Your request to claim <strong>{pendingClaims[0].masjidName}</strong> is currently being reviewed by our team. We will notify you once your access is approved.
              </p>
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-up">
              <h2 className="text-2xl font-bold mb-4">Welcome to Home Masjid</h2>
              <p className="text-muted-foreground mb-6">
                You currently do not have access to manage any masjids. If you are a faculty member, please claim your masjid from its profile page.
              </p>
              <Link href="/masjids" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-light transition-colors">
                Explore Masjids
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
