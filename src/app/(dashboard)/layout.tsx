"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  FolderKanban,
  MessageSquare,
  Settings,
  Menu,
  X,
} from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, id: "sidebar-overview" },
  { href: "/dashboard/programs", label: "Programs", icon: Calendar, id: "sidebar-programs" },
  { href: "/dashboard/posts", label: "Posts", icon: FileText, id: "sidebar-posts" },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban, id: "sidebar-projects" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, id: "sidebar-messages" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, id: "sidebar-settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-surface border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link
            href="/dashboard"
            id="sidebar-logo"
            className="text-lg font-bold text-gradient-primary"
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
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              id={item.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
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
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          </div>

          {/* User Avatar Placeholder */}
          <div
            id="dashboard-user-avatar"
            className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary"
          >
            U
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
