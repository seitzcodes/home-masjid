import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Home Masjid",
  description: "Terms of Service for Home Masjid, outlining rules and guidelines for platform usage.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using Home Masjid, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            Home Masjid provides a directory and community platform for masjids. Verified faculty members can post programs, manage donations, and update prayer times. Public users can discover nearby masjids, follow their updates, and securely donate to community projects.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Conduct</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to use the platform only for lawful purposes. You must not:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mt-4 space-y-2">
            <li>Post any content that is offensive, defamatory, or violates community standards.</li>
            <li>Attempt to claim a masjid profile without proper authorization from the masjid's governing body.</li>
            <li>Use the platform to distribute spam or malicious software.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Donations and Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            All donations made through Home Masjid are securely processed via Paystack. Home Masjid acts as a facilitator and does not take a percentage cut of the donation. Donors must ensure the legitimacy of the campaign before donating. Refunds are handled on a case-by-case basis by the respective masjid faculty.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>
      </div>
    </div>
  );
}
