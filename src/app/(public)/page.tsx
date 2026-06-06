import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Heart, UserCog, LineChart, Globe, ArrowDown } from "lucide-react";

const musalleeFeatures = [
  {
    id: "feature-discover",
    icon: MapPin,
    title: "Discover Masjids",
    description:
      "Find nearby masjids with accurate prayer times, directions, and community information.",
  },
  {
    id: "feature-programs",
    icon: Calendar,
    title: "Community Programs",
    description:
      "Stay updated with youth programs, lectures, Quran classes, and community events.",
  },
  {
    id: "feature-support",
    icon: Heart,
    title: "Support Projects",
    description:
      "Donate to community projects, track fundraising progress, and make an impact.",
  },
];

const facultyFeatures = [
  {
    id: "feature-manage",
    icon: UserCog,
    title: "Manage Profiles",
    description:
      "Easily update Iqama times, post announcements, and maintain your masjid's digital presence.",
  },
  {
    id: "feature-fundraise",
    icon: LineChart,
    title: "Fundraising & Projects",
    description:
      "Launch transparent donation campaigns for your community and track progress in real-time.",
  },
  {
    id: "feature-network",
    icon: Globe,
    title: "Inter-Masjid Networking",
    description:
      "Connect with other verified masjids globally, invite speakers, and collaborate on events.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden py-32 sm:py-40 lg:py-48 min-h-[700px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/home-masjid-hero.png"
            alt="Home Masjid Background"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-[#0F172A]/80" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your Home. Your Masjid.{" "}
            <span className="text-accent">Connected.</span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-slate-200 leading-relaxed">
            The platform connecting congregations to their masjids, and masjids to the global ummah.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md sm:max-w-none">
            <a
              href="#for-musallees"
              className="w-full sm:w-auto rounded-xl bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-md transition-all hover:bg-accent-light hover:shadow-lg flex items-center justify-center gap-2"
            >
              For Musallees
              <ArrowDown className="w-5 h-5" />
            </a>
            <a
              href="#for-faculty"
              className="w-full sm:w-auto rounded-xl border-2 border-white/80 bg-transparent px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10 flex items-center justify-center gap-2"
            >
              For Masjid Faculty
              <ArrowDown className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* For Musallees Section */}
      <section id="for-musallees" className="py-24 sm:py-32 scroll-mt-16 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              For Musallees
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Stay connected to your local community. Discover masjids, track prayer times, and engage with programs that matter to you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            {musalleeFeatures.map((feature, index) => (
              <div
                key={feature.id}
                className="animate-fade-up bg-surface rounded-2xl p-8 shadow-sm border border-border transition-all duration-300 hover:shadow-md hover:border-accent/30"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-light hover:shadow-md"
            >
              Find your Home Masjid
            </Link>
          </div>
        </div>
      </section>

      {/* For Masjid Faculty Section */}
      <section id="for-faculty" className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-900/50 scroll-mt-16 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              For Masjid Faculty
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Powerful tools to manage your congregation and network globally. Take control of your digital presence and foster deeper community ties.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            {facultyFeatures.map((feature, index) => (
              <div
                key={feature.id}
                className="animate-fade-up bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-border transition-all duration-300 hover:shadow-md hover:border-accent/30"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-6">
                  <feature.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/register?type=faculty"
              className="inline-flex rounded-xl bg-foreground text-background px-8 py-4 text-base font-semibold shadow-sm transition-all hover:bg-foreground/90 hover:shadow-md"
            >
              Register Your Masjid
            </Link>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image Column */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-square animate-fade-up border border-border">
              <Image
                src="/media/About Us  Our Mission (Platform Focus).png"
                alt="Our Mission - Connecting Masjids globally, starting locally"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Text Column */}
            <div className="animate-fade-up" style={{ animationDelay: "200ms", animationFillMode: "backwards" }}>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-6">
                Our Mission
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  At its core, Home Masjid is about connection. We believe that the masjid is the beating heart of the community, and in today's digital age, that connection should be seamless, accessible, and deeply personal.
                </p>
                <p>
                  Starting from South Africa and reaching globally, we are building a digital network that brings your local congregation to your fingertips. Whether you're a community member looking for spiritual enrichment or a faculty member managing daily operations, our platform bridges the gap with modern tools.
                </p>
                <div className="pt-6 flex items-center space-x-4">
                  <div className="w-12 h-1 bg-accent rounded-full" />
                  <p className="text-sm font-semibold text-accent uppercase tracking-wider">
                    Rooted Locally. Connected Globally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
