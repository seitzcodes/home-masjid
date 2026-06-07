import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Donation Ledger | Dashboard",
};

type Props = { params: Promise<{ id: string }> };

export default async function ProjectLedgerPage({ params }: Props) {
  const { id: projectId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the project and verify faculty access
  const { data: project } = await (supabase as any).from("projects")
    .select("id, title, goal_amount, current_amount, masjid_id")
    .eq("id", projectId)
    .single();

  if (!project) redirect("/dashboard/projects");

  const { data: faculty } = await (supabase as any).from("masjid_faculty")
    .select("id")
    .eq("user_id", user.id)
    .eq("masjid_id", project.masjid_id!)
    .single();

  if (!faculty) redirect("/dashboard/projects");

  // Fetch donations with donor profile info
  const { data: donations } = await (supabase as any).from("donations")
    .select("id, amount, payment_status, created_at, is_anonymous, is_recurring, user_id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(100);

  // Batch-fetch user profiles for non-anonymous donors
  const userIds = [
    ...new Set(
      donations
        ?.filter((d: any) => !d.is_anonymous && d.user_id)
        .map((d: any) => d.user_id!) ?? []
    ),
  ];

  const profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await (supabase as any).from("user_profiles")
      .select("id, full_name")
      .in("id", userIds);
    profiles?.forEach((p: any) => {
      profileMap[p.id] = p.full_name;
    });
  }

  const formatZar = (n: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(n);

  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const completedTotal =
    donations
      ?.filter((d: any) => d.payment_status === "completed")
      .reduce((sum: number, d: any) => sum + d.amount, 0) ?? 0;

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h1 className="text-xl font-bold text-foreground">{project.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">Donation Ledger</p>
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Collected</p>
            <p className="text-2xl font-bold text-[#D4AF37]">{formatZar(completedTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Goal</p>
            <p className="text-2xl font-bold text-foreground">{formatZar(project.goal_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Donations</p>
            <p className="text-2xl font-bold text-foreground">{donations?.length ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 dark:bg-[#0F172A]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Donor
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Amount
                </th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Type
                </th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {!donations || donations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    No donations yet.
                  </td>
                </tr>
              ) : (
                donations.map((d: any) => {
                  const donorName = d.is_anonymous
                    ? "Anonymous"
                    : d.user_id
                    ? profileMap[d.user_id] ?? "Unknown"
                    : "Guest";

                  return (
                    <tr key={d.id} className="border-b border-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                        {d.created_at
                          ? new Date(d.created_at).toLocaleDateString("en-ZA", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-foreground">
                        <span className={d.is_anonymous ? "italic text-muted-foreground" : ""}>
                          {donorName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-[#D4AF37]">
                        {formatZar(d.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {d.is_recurring ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                            <RefreshCw className="w-3 h-3" />
                            Monthly
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Once</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[d.payment_status ?? "pending"] ?? statusColors.pending
                          }`}
                        >
                          {d.payment_status ?? "pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
