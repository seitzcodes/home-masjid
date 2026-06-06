import Link from "next/link";
import { User, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Welcome | Home Masjid",
};

export default function OnboardingPage() {
  return (
    <div className="w-full max-w-3xl animate-fade-up">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Welcome to Home Masjid
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          How would you like to use the platform?
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Musallee Path */}
        <Link
          href="/onboarding/musallee"
          className="group relative flex flex-col rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <User className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            I'm a Community Member
          </h2>
          <p className="mt-2 text-sm text-muted-foreground flex-1">
            Find your local masjid, stay updated with programs, and connect with
            your congregation.
          </p>
          <div className="mt-6 flex items-center text-sm font-semibold text-primary">
            Continue as Musallee
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </Link>

        {/* Faculty Path */}
        <Link
          href="/onboarding/faculty"
          className="group relative flex flex-col rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:border-accent hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-primary-foreground">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            I'm a Masjid Official
          </h2>
          <p className="mt-2 text-sm text-muted-foreground flex-1">
            Claim or register your masjid's profile to post updates, manage
            events, and track campaigns.
          </p>
          <div className="mt-6 flex items-center text-sm font-semibold text-accent">
            Continue as Faculty
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
