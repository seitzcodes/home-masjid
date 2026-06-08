import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Home Masjid",
  description: "Privacy Policy for Home Masjid, outlining how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Home Masjid. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Data We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mt-4 space-y-2">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Location Data:</strong> includes your GPS location (if you grant permission) to help you find nearby masjids and calculate accurate prayer times.</li>
            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of donations you have made to masjids through our platform.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use third-party services to facilitate our platform operations. Specifically:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mt-4 space-y-2">
            <li><strong>Paystack:</strong> We use Paystack to securely process donations. We do not store your raw credit card information on our servers.</li>
            <li><strong>Supabase:</strong> We use Supabase for secure database storage and authentication.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@homemasjid.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Child Safety and Reporting</h2>
          <p className="text-muted-foreground leading-relaxed">
            Protecting children is of paramount importance to us. In accordance with Google Play's Child Safety Standards policy, Home Masjid is committed to keeping our platform free of Child Sexual Abuse and Exploitation (CSAE).
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mt-4 space-y-2">
            <li>If you report an incident of CSAE or CSAM using our in-app reporting mechanisms or via email at <strong>safety@homemasjid.com</strong>, we collect the necessary information to thoroughly investigate the claim.</li>
            <li>We may share user data, metadata, and report details with relevant law enforcement agencies and child protection organizations if we determine that a user has violated our zero-tolerance policy on child safety.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
