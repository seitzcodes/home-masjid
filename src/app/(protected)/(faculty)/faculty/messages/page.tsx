import Image from "next/image";
import { MessageSquarePlus, Globe } from "lucide-react";

export const metadata = {
  title: "Messages & Collaboration | Dashboard",
};

export default function DashboardMessagesPage() {
  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Inter-Masjid Collaboration</h1>
        <p className="mt-2 text-muted-foreground">
          Network with verified faculty members globally and coordinate events.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 w-full bg-[#0F172A]">
          <Image
            src="/media/Inter-Masjid Collaboration (Networking).png"
            alt="Inter-Masjid Collaboration"
            fill
            className="object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        </div>

        {/* Empty State Content */}
        <div className="p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
            <Globe size={32} />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Your Global Network
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            Connect directly with verified imams, administrators, and committee members from other masjids. Whether you want to invite a guest speaker, share program ideas, or ask for advice, our encrypted messaging keeps your faculty connected.
          </p>

          <button className="flex items-center rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-accent/90 transition-colors">
            <MessageSquarePlus className="mr-2 h-5 w-5" />
            Start a Conversation
          </button>
        </div>
      </div>
    </div>
  );
}
