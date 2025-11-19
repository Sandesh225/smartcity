// FILE: components/citizen/dashboard/RecentComplaints.tsx
'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Command, ArrowUpRight } from "lucide-react";

type ComplaintSummary = {
  id: string;
  tracking_id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  category_id: string | null;
};

type RecentComplaintsProps = {
  complaints: ComplaintSummary[];
};

export default function RecentComplaints({ complaints }: RecentComplaintsProps) {
  const topComplaints = complaints.slice(0, 6);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 sm:text-base">
            Recent complaints
          </h2>
          <p className="text-[11px] text-slate-400 sm:text-xs">
            Quick snapshot of your latest submissions.
          </p>
        </div>
        <Link
          href="/citizen/complaints"
          className="inline-flex items-center gap-1 rounded-full border border-glass-soft bg-surface-subtle px-2.5 py-1 text-[10px] text-emerald-200 hover:border-emerald-400/70 hover:text-emerald-100"
        >
          <span>View all</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <motion.div
        className="rounded-2xl border border-glass-soft bg-surface-deep/95 shadow-glass-sm"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <ul className="divide-y divide-surface-soft/70">
          {topComplaints.map((c) => (
            <li
              key={c.id}
              className="group relative overflow-hidden px-3.5 py-3 text-xs text-slate-200 transition-colors hover:bg-surface-subtle/90 sm:px-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex flex-col items-center">
                  <span className="rounded-full bg-surface-soft px-2 py-[2px] font-mono text-[10px] text-slate-400">
                    {c.tracking_id.slice(0, 8)}
                  </span>
                  <span className="mt-1 rounded-full bg-surface-subtle px-1.5 py-[2px] text-[9px] text-slate-500">
                    {formatTimeAgo(c.created_at)}
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/citizen/complaints/${c.id}`}
                      className="line-clamp-1 text-[13px] font-medium text-slate-50 hover:text-emerald-200"
                    >
                      {c.title}
                    </Link>
                    <div className="hidden items-center gap-1 text-[10px] text-slate-500 sm:flex">
                      <Command className="h-3 w-3" />
                      <span>Open</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusChip status={c.status} />
                    <PriorityChip priority={c.priority} />
                    {c.category_id && (
                      <span className="rounded-full bg-surface-soft px-2 py-[2px] text-[10px] text-slate-400">
                        Category #{c.category_id.slice(0, 4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}

          {topComplaints.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-slate-400">
              No recent complaints found.
            </li>
          )}
        </ul>
      </motion.div>
    </section>
  );
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} hr${diffH === 1 ? "" : "s"} ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} day${diffD === 1 ? "" : "s"} ago`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 4) return `${diffW} wk${diffW === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString();
}

function StatusChip({ status }: { status: string }) {
  const normalized = status as
    | "new"
    | "in_progress"
    | "resolved"
    | "closed"
    | "rejected"
    | string;

  let label = "Unknown";
  let classes =
    "bg-surface-soft text-slate-300 border border-slate-600/60";

  if (normalized === "new") {
    label = "New";
    classes = "bg-emerald-500/10 text-emerald-200 border border-emerald-500/40";
  } else if (normalized === "in_progress") {
    label = "In progress";
    classes = "bg-sky-500/10 text-sky-200 border border-sky-500/40";
  } else if (normalized === "resolved") {
    label = "Resolved";
    classes = "bg-emerald-400/10 text-emerald-200 border border-emerald-400/50";
  } else if (normalized === "closed") {
    label = "Closed";
    classes = "bg-slate-600/20 text-slate-200 border border-slate-500/60";
  } else if (normalized === "rejected") {
    label = "Rejected";
    classes = "bg-rose-500/10 text-rose-200 border border-rose-500/50";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] ${classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{label}</span>
    </span>
  );
}

function PriorityChip({ priority }: { priority: string }) {
  const normalized = priority as
    | "low"
    | "medium"
    | "high"
    | "critical"
    | string;

  let label = "Medium";
  let classes =
    "bg-amber-500/10 text-amber-200 border border-amber-500/40";

  if (normalized === "low") {
    label = "Low";
    classes =
      "bg-slate-700/40 text-slate-200 border border-slate-500/60";
  } else if (normalized === "medium") {
    label = "Medium";
  } else if (normalized === "high") {
    label = "High";
    classes = "bg-orange-500/10 text-orange-200 border border-orange-500/50";
  } else if (normalized === "critical") {
    label = "Critical";
    classes = "bg-rose-500/10 text-rose-200 border border-rose-500/50";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] ${classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{label}</span>
    </span>
  );
}
