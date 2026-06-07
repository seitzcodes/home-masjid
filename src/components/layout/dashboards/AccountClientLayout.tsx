"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Heart, Star, Settings, Menu, X } from "lucide-react";

const navItems = [
  { href: "/account", label: "Profile", icon: User, id: "account-profile" },
  { href: "/account/donations", label: "Donations", icon: Heart, id: "account-donations" },
  { href: "/account/following", label: "Following", icon: Star, id: "account-following" },
  { href: "/account/settings", label: "Settings", icon: Settings, id: "account-settings" },
];

export default function AccountClientLayout({
  children,
  userInitials,
  userName,
}: {
  children: React.ReactNode;
  userInitials: string;
  userName: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-slate-900 dark:text-white">
          Home Masjid
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/masjids" className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Explore Masjids
          </Link>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
            <span className="hidden sm:block text-sm font-medium">{userName}</span>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {userInitials}
            </div>
            <button className="md:hidden ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar / Mobile Topbar */}
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <nav className="space-y-1 bg-white dark:bg-slate-900 p-2 md:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  id={item.id}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary dark:text-[#D4AF37] dark:bg-[#D4AF37]/10"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-primary dark:text-[#D4AF37]" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 min-h-[500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
