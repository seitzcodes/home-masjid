"use client";

import { useState, useTransition } from "react";
import { Heart, Power, FileText, TrendingUp, Users } from "lucide-react";
import { toggleProjectStatus } from "@/app/(protected)/(faculty)/faculty/projects/actions";
import Link from "next/link";

interface ProjectManagementCardProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    goal_amount: number;
    current_amount: number;
    is_active: boolean;
    cover_image_url?: string | null;
    donor_count?: number;
  };
}

export function ProjectManagementCard({ project }: ProjectManagementCardProps) {
  const [isActive, setIsActive] = useState(project.is_active);
  const [isPending, startTransition] = useTransition();

  const progress = Math.min(
    100,
    Math.round((project.current_amount / project.goal_amount) * 100)
  );

  const formatZar = (n: number) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleProjectStatus(project.id, !isActive);
      if (!result?.error) {
        setIsActive((prev) => !prev);
      }
    });
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Cover image strip */}
      {project.cover_image_url ? (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${project.cover_image_url})` }}
        />
      ) : (
        <div className="h-32 bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center">
          <Heart className="w-10 h-10 text-[#D4AF37]/40" />
        </div>
      )}

      <div className="p-5">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground text-base leading-tight">{project.title}</h3>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
              isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span className="font-medium text-[#D4AF37]">{formatZar(project.current_amount)}</span>
            <span>of {formatZar(project.goal_amount)} goal</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {project.donor_count ?? 0} donor{(project.donor_count ?? 0) !== 1 ? "s" : ""}
            </span>
            <span className="text-xs font-medium text-[#D4AF37]">{progress}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/dashboard/projects/${project.id}/ledger`}
            className="flex items-center gap-1.5 flex-1 justify-center py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface-hover transition-colors"
          >
            <FileText className="w-4 h-4" />
            Ledger
          </Link>
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center gap-1.5 flex-1 justify-center py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 ${
              isActive
                ? "bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-900/20"
                : "bg-primary text-primary-foreground hover:bg-primary-light"
            }`}
          >
            <Power className="w-4 h-4" />
            {isPending ? "…" : isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
