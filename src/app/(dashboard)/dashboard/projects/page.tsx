import Image from "next/image";
import { PlusCircle, Heart } from "lucide-react";

export const metadata = {
  title: "Projects | Dashboard",
};

export default function DashboardProjectsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Community Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Launch and manage fundraising campaigns for your masjid's growth and maintenance.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 w-full bg-muted">
          <Image
            src="/media/Donation Projects (Funding for Growth).png"
            alt="Community Supported Project"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        </div>

        {/* Empty State Content */}
        <div className="p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <Heart size={32} />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Fund Your Community's Future
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            Whether you're building a new wudu facility, installing solar panels, or setting up a water borehole, Home Masjid helps you securely collect and track donations from your congregation and the global community.
          </p>

          <button className="flex items-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-light transition-colors">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Your First Project
          </button>
        </div>
      </div>
    </div>
  );
}
