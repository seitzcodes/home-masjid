import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { href: "/", label: "Home", id: "footer-home" },
  { href: "/masjids", label: "Explore Masjids", id: "footer-explore" },
  { href: "/programs", label: "Programs", id: "footer-programs" },
];

const socialLinks = [
  { href: "#", label: "Twitter", id: "footer-twitter" },
  { href: "#", label: "Instagram", id: "footer-instagram" },
  { href: "#", label: "Facebook", id: "footer-facebook" },
];

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* About */}
          <div>
            <Link href="/" id="footer-logo" className="flex items-center mb-4">
              <Image 
                src="/Home Masjid (Light BG).svg" 
                alt="Home Masjid Logo" 
                width={160} 
                height={48} 
                className="logo-light"
              />
              <Image 
                src="/Home Masjid (Dark BG).svg" 
                alt="Home Masjid Logo" 
                width={160} 
                height={48} 
                className="logo-dark"
              />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Connecting communities to their local masjids with prayer times,
              programs, and projects — all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    id={link.id}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Connect
            </h4>
            <ul className="mt-3 space-y-2">
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    id={link.id}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Home Masjid. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
