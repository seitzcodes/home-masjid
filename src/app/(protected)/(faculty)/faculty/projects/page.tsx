import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectManagementCard } from "@/components/donation/ProjectManagementCard";
import { CreateProjectForm } from "@/components/donation/CreateProjectForm";
import { PlusCircle, Heart } from "lucide-react";

export const metadata = {
  title: "Projects | Dashboard",
};

export default async function DashboardProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get the faculty's masjid
  const { data: faculty } = await (supabase as any).from("masjid_faculty")
    .select("masjid_id")
    .eq("user_id", user.id)
    .single();

  if (!faculty?.masjid_id) {
    return (
      <div className="w-full max-w-5xl mx-auto animate-fade-up">
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Masjid Found</h2>
          <p className="text-muted-foreground">
            You need to be a verified faculty member to manage projects.
          </p>
        </div>
      </div>
    );
  }

  // Fetch projects with donor counts
  const { data: projects } = await (supabase as any).from("projects")
    .select("id, title, description, goal_amount, current_amount, is_active, cover_image_url")
    .eq("masjid_id", faculty.masjid_id)
    .order("created_at", { ascending: false });

  // Get donor counts per project
  const donorCounts: Record<string, number> = {};
  if (projects && projects.length > 0) {
    const projectIds = projects.map((p: any) => p.id);
    const { data: donationCounts } = await (supabase as any).from("donations")
      .select("project_id")
      .in("project_id", projectIds)
      .eq("payment_status", "completed");

    donationCounts?.forEach((d: any) => {
      donorCounts[d.project_id!] = (donorCounts[d.project_id!] || 0) + 1;
    });
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community Projects</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Launch and manage fundraising campaigns for your masjid's growth.
          </p>
        </div>
        <CreateProjectTrigger />
      </div>

      {/* Create form (hidden by default, shown via client interaction) */}
      <CreateProjectForm />

      {/* Project grid */}
      {!projects || projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project: any) => (
            <ProjectManagementCard
              key={project.id}
              project={{
                ...project,
                is_active: project.is_active ?? false,
                current_amount: project.current_amount ?? 0,
                donor_count: donorCounts[project.id] ?? 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateProjectTrigger() {
  return (
    <label
      htmlFor="create-project-toggle"
      className="flex items-center gap-2 cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-light transition-colors"
    >
      <PlusCircle className="h-4 w-4" />
      New Project
    </label>
  );
}

function EmptyState() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-12 text-center">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-3 text-foreground">Fund Your Community's Future</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
        Whether you're building a new wudu facility, installing solar panels, or setting up a water
        borehole — Home Masjid helps you securely collect and track donations from your congregation.
      </p>
      <label
        htmlFor="create-project-toggle"
        className="inline-flex items-center cursor-pointer rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-light transition-colors"
      >
        <PlusCircle className="mr-2 h-5 w-5" />
        Create Your First Project
      </label>
    </div>
  );
}
