"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X, Sun, Moon, User, LogOut, LayoutDashboard, Home, Settings, ShieldAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useHijriDate } from "@/hooks/useHijriDate";

const navLinks = [
  { href: "/", label: "Home", id: "nav-home" },
  { href: "/masjids", label: "Explore Masjids", id: "nav-explore" },
  { href: "/programs", label: "Programs", id: "nav-programs" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isFaculty, setIsFaculty] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const hijriInfo = useHijriDate(null); // Will attempt geolocation, fallback to Joburg

  useEffect(() => {
    setMounted(true);

    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await (supabase as any).from("user_profiles").select("home_masjid_id, is_superadmin").eq("id", user.id).single();
        setProfile(profileData);
        setIsSuperAdmin(profileData?.is_superadmin || false);
        
        const { count } = await (supabase as any).from("masjid_faculty").select("*", { count: "exact", head: true }).eq("user_id", user.id);
        setIsFaculty(!!count);
      }
    };

    fetchUser();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setProfile(null);
        setIsFaculty(false);
        setIsSuperAdmin(false);
      } else {
        fetchUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="bg-[#F8FAFC] text-[#0F172A] dark:bg-transparent dark:text-foreground sticky top-0 z-50 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            id="header-logo"
            className="flex items-center flex-shrink-0"
          >
            <Image 
              src="/Home Masjid (Light BG).svg" 
              alt="Home Masjid Logo" 
              width={200} 
              height={56} 
              priority
              className="logo-light"
            />
            <Image 
              src="/Home Masjid (Dark BG).svg" 
              alt="Home Masjid Logo" 
              width={200} 
              height={56} 
              priority
              className="logo-dark"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                id={link.id}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/feed"
                id="nav-feed"
                className="text-sm font-medium text-primary transition-colors hover:text-primary-dark"
              >
                My Feed
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Hijri Date Display */}
            {hijriInfo && (
              <div className="hidden lg:flex items-center text-sm font-medium text-amber-700 dark:text-[#D4AF37] px-3 py-1.5 rounded-full bg-surface border border-border">
                <Moon className="w-4 h-4 mr-2" />
                {hijriInfo.dateStr}
              </div>
            )}

            {/* Theme Toggle */}
            {mounted ? (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover transition-colors"
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}

            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center rounded-full bg-surface p-2 text-foreground hover:bg-surface-hover border border-border transition-colors"
                  aria-label="User menu"
                >
                  <User className="h-5 w-5" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-surface shadow-lg border border-border py-1 z-50">
                    {isSuperAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-danger hover:bg-surface-hover"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Admin Portal
                      </Link>
                    )}
                    {isFaculty && (
                      <Link
                        href="/faculty"
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-surface-hover"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Faculty Portal
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-surface-hover"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  id="header-login"
                  className="hidden sm:inline-flex text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  id="header-register"
                  className="hidden sm:inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              id="header-mobile-toggle"
              type="button"
              className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-surface-hover transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t border-border px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              id={`${link.id}-mobile`}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/feed"
              id="nav-feed-mobile"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-surface-hover hover:text-primary-dark transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Feed
            </Link>
          )}
          
          {user ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-border mt-2">
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-surface-hover transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Admin Portal
                </Link>
              )}
              {isFaculty && (
                <Link
                  href="/faculty"
                  className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Faculty Portal
                </Link>
              )}
              <Link
                href="/account"
                className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="mr-2 h-4 w-4" />
                My Account
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2 border-t border-border mt-2">
              <Link
                href="/login"
                id="header-login-mobile"
                className="flex-1 text-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                id="header-register-mobile"
                className="flex-1 text-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-dark transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
