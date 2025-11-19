// FILE: components/citizen/complaints/detail/ComplaintHeader.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import { StatusPill } from "./StatusPill";
import { PriorityPill } from "./PriorityPill";
import type { ComplaintSummaryViewModel } from "./types";
import { formatDateTime, formatTimeAgo, getCitizenSummaryLine } from "./utils";

interface ComplaintHeaderProps {
  summary: ComplaintSummaryViewModel;
  canProvideFeedback: boolean;
}

export function ComplaintHeader({ summary, canProvideFeedback }: ComplaintHeaderProps) {
  const { complaint, category, ward } = summary;

  const lastActivity =
    complaint.resolved_at || complaint.sla_due_date || complaint.created_at;

  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="relative overflow-hidden rounded-2xl border border-glass-soft bg-surface-deep/90 px-4 py-4 sm:px-6 sm:py-5 shadow-glass-xl backdrop-blur-md"
    >
      {/* subtle glow */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: title, status, meta */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-base font-semibold text-slate-50 sm:text-lg md:text-xl">
              {complaint.title}
            </h1>
            <StatusPill status={complaint.status} />
            {complaint.is_overdue && (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/50 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-100">
                <AlertTriangle className="h-3 w-3" />
                <span>Overdue</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-300/80">
            <span className="font-mono text-xs text-slate-400">
              {complaint.tracking_id}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-500/60" />
            <span>
              Created{" "}
              <span className="font-medium">
                {formatDateTime(complaint.created_at)}
              </span>
            </span>
            {category && (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-500/60" />
                <span className="truncate">
                  Category:{" "}
                  <span className="font-medium text-slate-100">
                    {category.category_name}
                  </span>
                </span>
              </>
            )}
            {ward && (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-500/60" />
                <span>
                  Ward {ward.ward_number}
                  {ward.ward_name ? ` · ${ward.ward_name}` : ""}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PriorityPill priority={complaint.priority} />
            {lastActivity && (
              <span className="text-[11px] text-slate-400">
                Last activity:{" "}
                <span className="font-medium text-slate-200">
                  {formatTimeAgo(lastActivity)}
                </span>
              </span>
            )}
          </div>

          <p className="max-w-2xl text-xs text-slate-300/90 sm:text-sm">
            {getCitizenSummaryLine(complaint.status)}
          </p>

          {canProvideFeedback && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/8 px-3 py-1 text-[11px] text-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <span>
                This complaint is complete. Scroll down to{" "}
                <span className="font-semibold">rate the resolution</span>.
              </span>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-start justify-between gap-2 lg:flex-col lg:items-end">
          <Link
            href="/citizen/complaints"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-soft/80 px-3 py-1.5 text-xs text-slate-200 shadow-glass-sm transition hover:border-emerald-400/60 hover:text-emerald-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to complaints</span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
