// FILE: components/citizen/dashboard/StatsOverview.tsx
'use client';

import { motion } from "framer-motion";
import { Clock3, CheckCircle2, BarChart3, Sparkles } from "lucide-react";
import InsightCard from "./InsightCard";

type ComplaintStats = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  resolutionRate: number;
  lastActivityAt: string | null;
  mostRecent: {
    id: string;
    tracking_id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
  } | null;
};

type StatsOverviewProps = {
  stats: ComplaintStats;
};

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const { total, open, inProgress, resolved, resolutionRate } = stats;

  const activeRatio =
    total === 0 ? 0 : Math.round(((open + inProgress) / total) * 100);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 sm:text-base">
            Complaint activity & insights
          </h2>
          <p className="text-[11px] text-slate-400 sm:text-xs">
            A quick overview of how your complaints are moving through the system.
          </p>
        </div>
        <div className="hidden rounded-full bg-surface-subtle px-2.5 py-1 text-[10px] text-slate-400 sm:inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-emerald-300" />
          Smart insights
        </div>
      </div>

      <motion.div
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <InsightCard
          title="Total complaints"
          metric={total}
          subtitle="All time"
          icon={BarChart3}
          accent="neutral"
          footer={`${resolved} resolved · ${open + inProgress} active`}
        />

        <InsightCard
          title="Currently open"
          metric={open + inProgress}
          subtitle={`${open} new · ${inProgress} in progress`}
          icon={Clock3}
          accent="warning"
          footer={`~${activeRatio}% of your complaints are still active`}
        />

        <InsightCard
          title="Resolution rate"
          metric={`${resolutionRate}%`}
          subtitle="Resolved vs total complaints"
          icon={CheckCircle2}
          accent="success"
          footer={
            resolutionRate >= 60
              ? "Great job following up with the municipality."
              : "Keep an eye on open issues to raise overall resolution."
          }
        />
      </motion.div>
    </section>
  );
}
