import { Users, Calendar, FileText, Heart, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Get the current user's faculty masjid ID
  const { data: facultyRoles } = await (supabase as any).from("masjid_faculty")
    .select("masjid_id, masjids(name, is_public_directory_listed)")
    .eq("user_id", user.id)
    .single();
  
  const masjidId = facultyRoles?.masjid_id;
  const masjidName = (facultyRoles?.masjids as any)?.name || "your masjid";
  const isPublic = (facultyRoles?.masjids as any)?.is_public_directory_listed ?? true;

  let followerCount = 0;
  let programCount = 0;
  let postCount = 0;
  let totalDonations = 0;
  let recentActivity: any[] = [];

  if (masjidId) {
    // Fetch Followers count
    const { count: fCount } = await (supabase as any).from("followers")
      .select("*", { count: "exact", head: true })
      .eq("masjid_id", masjidId);
    followerCount = fCount || 0;

    // Fetch Programs count
    const { count: prCount } = await (supabase as any).from("programs")
      .select("*", { count: "exact", head: true })
      .eq("masjid_id", masjidId);
    programCount = prCount || 0;

    // Fetch Posts count
    const { count: pCount } = await (supabase as any).from("posts")
      .select("*", { count: "exact", head: true })
      .eq("masjid_id", masjidId);
    postCount = pCount || 0;

    // Aggregate Donations
    // First, find projects for this masjid
    const { data: projects } = await (supabase as any).from("projects")
      .select("id")
      .eq("masjid_id", masjidId);
    
    if (projects && projects.length > 0) {
      const projectIds = projects.map((p: any) => p.id);
      // Currently, donations don't have masjid_id, they have project_id. 
      // But we added incrementing current_amount on projects directly in webhook!
      // So let's aggregate current_amount from projects.
      const { data: projectsAmounts } = await (supabase as any).from("projects")
        .select("current_amount")
        .eq("masjid_id", masjidId);
      
      totalDonations = projectsAmounts?.reduce((sum: number, p: any) => sum + (p.current_amount || 0), 0) || 0;

      // Fetch recent donations as activity
      const { data: latestDonations } = await (supabase as any).from("donations")
        .select("amount, created_at, payment_status, projects(title)")
        .in("project_id", projectIds)
        .eq("payment_status", "completed")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (latestDonations) {
        recentActivity = latestDonations.map((d: any) => ({
          type: "donation",
          amount: d.amount,
          projectTitle: (d.projects as any)?.title,
          date: new Date(d.created_at as string).toLocaleDateString()
        }));
      }
    }
  }

  const stats = [
    { id: "stat-followers", label: "Followers", value: followerCount.toLocaleString(), icon: Users },
    { id: "stat-programs", label: "Programs", value: programCount.toLocaleString(), icon: Calendar },
    { id: "stat-posts", label: "Posts", value: postCount.toLocaleString(), icon: FileText },
    { id: "stat-donations", label: "Donations", value: `R ${totalDonations.toLocaleString()}`, icon: Heart },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">
        Welcome to your Dashboard
      </h2>
      <p className="mt-1 text-muted-foreground flex items-center gap-2">
        Here&apos;s an overview of {masjidName}&apos;s activity.
        {!isPublic && (
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium border border-slate-200">
            Private Facility
          </span>
        )}
      </p>

      {/* Private Facility Invite Link */}
      {!isPublic && masjidId && (
        <div className="mt-6 bg-[#0F172A] rounded-xl p-5 border border-slate-700 shadow-md flex items-center justify-between">
          <div>
            <h3 className="text-[#D4AF37] font-bold text-lg">Secure Invite Link</h3>
            <p className="text-slate-300 text-sm mt-1">This facility is hidden from the public directory. Share this link for members to join.</p>
            <div className="mt-3 bg-slate-800 rounded-md py-2 px-3 border border-slate-600 font-mono text-xs text-slate-200 select-all">
              https://homemasjid.com/masjids/{masjidId}?invite={masjidId.split('-')[0]}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            id={stat.id}
            className="bg-surface rounded-xl p-6 shadow-sm border border-border transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-[#0F172A]">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                <stat.icon className="h-6 w-6 text-[#D4AF37]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-10">
        <h3 className="text-lg font-bold text-[#0F172A] mb-4">
          Recent Activity
        </h3>
        <div
          id="recent-activity"
          className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm"
        >
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        New Donation: R {activity.amount}
                      </p>
                      <p className="text-xs text-slate-500">
                        To project: {activity.projectTitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-400">{activity.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-slate-900 font-semibold mb-1">No recent activity</h4>
              <p className="text-sm text-slate-500 max-w-sm">
                Start by creating a program, publishing a post, or setting up a donation project to engage your community.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
