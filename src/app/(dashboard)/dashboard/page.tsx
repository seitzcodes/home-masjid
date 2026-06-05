import { Users, Calendar, FileText, Heart } from "lucide-react";

const stats = [
  { id: "stat-followers", label: "Followers", value: "1,248", icon: Users },
  { id: "stat-programs", label: "Programs", value: "12", icon: Calendar },
  { id: "stat-posts", label: "Posts", value: "36", icon: FileText },
  { id: "stat-donations", label: "Donations", value: "$8,420", icon: Heart },
];

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">
        Welcome to your Dashboard
      </h2>
      <p className="mt-1 text-muted-foreground">
        Here&apos;s an overview of your masjid&apos;s activity.
      </p>

      {/* Stat Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            id={stat.id}
            className="bg-surface rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Activity
        </h3>
        <div
          id="recent-activity"
          className="mt-4 rounded-xl bg-surface p-6 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">
            No recent activity to show. Start by creating a program or
            publishing a post to engage your community.
          </p>
        </div>
      </div>
    </div>
  );
}
