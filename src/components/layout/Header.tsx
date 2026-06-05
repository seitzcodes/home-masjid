"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/", label: "Home", id: "nav-home" },
  { href: "/masjids", label: "Explore Masjids", id: "nav-explore" },
  { href: "/programs", label: "Programs", id: "nav-programs" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
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
          mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
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
        </nav>
      </div>
    </header>
  );
}
