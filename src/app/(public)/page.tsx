import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Heart } from "lucide-react";

const features = [
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

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden py-32 sm:py-40 lg:py-48 min-h-[600px]">
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
          <div className="absolute inset-0 bg-[#0F172A]/75" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your Home. Your Masjid.{" "}
            <span className="text-accent">Connected.</span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-slate-200 leading-relaxed">
            Discover local masjids, stay connected with community programs, and
            support meaningful projects — all from one beautiful platform.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/masjids"
              id="hero-explore-cta"
              className="rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-md transition-all hover:bg-accent-light hover:shadow-lg"
            >
              Explore Masjids
            </Link>
            <Link
              href="/register"
              id="hero-register-cta"
              className="rounded-xl border border-white px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white hover:text-primary"
            >
              Register Your Masjid
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything your community needs
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              One platform to unite your masjid and its people.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                id={feature.id}
                className="animate-fade-up bg-surface rounded-xl p-8 shadow transition-shadow duration-300 hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 sm:py-24 bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image Column */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-square animate-fade-up">
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
                <div className="pt-4 flex items-center space-x-4">
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
