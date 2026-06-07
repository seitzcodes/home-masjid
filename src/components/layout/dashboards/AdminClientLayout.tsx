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
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Moon
} from "lucide-react";
import { useHijriDate } from "@/hooks/useHijriDate";

const sidebarItems = [
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, id: "sidebar-analytics" },
  { href: "/admin/claims", label: "Review Claims", icon: ShieldCheck, id: "sidebar-claims" },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert, id: "sidebar-moderation" },
];

export default function AdminClientLayout({
  children,
  userInitials,
}: {
  children: React.ReactNode;
  userInitials: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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
            href="/admin"
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

        <nav className="mt-4 px-3 space-y-1">
          <div className="pt-4 pb-2 px-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Superadmin</p>
          </div>
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
        </nav>
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
            <div className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 rounded-md transition-colors">
              <span className="font-semibold">System Administration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              id="dashboard-user-avatar"
              className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary"
            >
              {userInitials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
