import Link from "next/link";
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
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        {/* Decorative gradient blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/5 blur-2xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your Home. Your Masjid.{" "}
            <span className="text-gradient-primary">Connected.</span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Discover local masjids, stay connected with community programs, and
            support meaningful projects — all from one beautiful platform.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/masjids"
              id="hero-explore-cta"
              className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary-dark hover:shadow-lg"
            >
              Explore Masjids
            </Link>
            <Link
              href="/register"
              id="hero-register-cta"
              className="rounded-xl border border-primary px-8 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
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
    </>
  );
}
