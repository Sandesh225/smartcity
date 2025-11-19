// FILE: components/citizen/dashboard/Hero.tsx
'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FileText, ListOrdered, Activity, Sparkles } from "lucide-react";

type ComplaintSummaryLite = {
  id: string;
  tracking_id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
};

type ComplaintStats = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  resolutionRate: number;
  lastActivityAt: string | null;
  mostRecent: ComplaintSummaryLite | null;
};

type HeroProps = {
  firstName: string;
  stats: ComplaintStats;
};

export default function Hero({ firstName, stats }: HeroProps) {
  const {
    total,
    open,
    resolved,
    resolutionRate,
    lastActivityAt,
    mostRecent,
  } = stats;

  const cityHealthScore =
    total === 0 ? 0 : Math.round((resolved / (open + resolved || 1)) * 100);

  return (
    <motion.section
      className="relative overflow-hidden rounded-3xl border border-glass-soft bg-surface-elevated/90 shadow-glass-xl backdrop-blur-2xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="absolute -right-32 bottom-[-4rem] h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-x-1/4 top-[-4rem] h-40 rounded-full bg-emerald-400/8 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between lg:gap-6">
        {/* Left: Greeting + quick actions */}
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-glass-soft bg-surface-subtle/80 px-3 py-1 text-[10px] font-medium tracking-[0.16em] uppercase text-emerald-200">
              <Sparkles className="h-3 w-3" />
              <span>Smart City Pokhara · Citizen Home</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl lg:text-3xl">
                Welcome back,{" "}
                <span className="text-emerald-300">{firstName}</span> 👋
              </h1>
              <p className="mt-1 max-w-xl text-xs text-slate-300 sm:text-sm">
                This is your personal command center for reporting issues, tracking
                progress, and seeing how your actions help keep Pokhara clean,
                safe, and vibrant.
              </p>
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <HeroBadge label="Total complaints" value={total} tone="neutral" />
            <HeroBadge label="Open" value={open} tone="warning" />
            <HeroBadge label="Resolved" value={resolved} tone="success" />
          </div>

          <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
            <Link
              href="/citizen/complaints/new"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_45px_rgba(16,185,129,0.7)] transition hover:brightness-110"
            >
              <FileText className="h-4 w-4" />
              <span>Submit new complaint</span>
            </Link>
            <Link
              href="/citizen/complaints"
              className="inline-flex items-center gap-2 rounded-full border border-glass-soft bg-surface-subtle/80 px-3.5 py-2 text-xs font-medium text-slate-100 hover:border-emerald-400/70 hover:text-emerald-100"
            >
              <ListOrdered className="h-4 w-4" />
              <span>View all complaints</span>
            </Link>
          </div>
        </div>

        {/* Right: Smart metrics + city health + Pokhara imagery */}
        <div className="mt-4 flex w-full flex-col gap-3 lg:mt-0 lg:w-[340px] xl:w-[380px]">
          {/* Metrics panel */}
          <motion.div
            className="rounded-2xl border border-glass-soft bg-surface-deep/95 px-3.5 py-3 shadow-glass-md"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.22 }}
          >
            <div className="mb-2 flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-medium text-slate-200">Today at a glance</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-2 py-[2px] text-[10px] text-emerald-200">
                <Activity className="h-3 w-3" />
                Active city flow
              </span>
            </div>

            {/* Resolution progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Resolution progress</span>
                <span className="font-semibold text-emerald-300">
                  {resolutionRate}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-sky-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${resolutionRate}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* City health + last activity */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="space-y-0.5 rounded-xl bg-surface-subtle/80 px-2 py-1.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  City health
                </p>
                <p className="text-sm font-semibold text-emerald-300">
                  {cityHealthScore} / 100
                </p>
                <p className="text-[10px] text-slate-400">
                  Based on your resolved vs. open complaints.
                </p>
              </div>
              <div className="space-y-0.5 rounded-xl bg-surface-subtle/80 px-2 py-1.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  Last activity
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  {lastActivityAt
                    ? new Date(lastActivityAt).toLocaleDateString()
                    : "No activity yet"}
                </p>
                <p className="text-[10px] text-slate-400">
                  Keep reporting issues to improve your neighborhood.
                </p>
              </div>
            </div>

            {/* Most recent complaint */}
            {mostRecent && (
              <div className="mt-3 rounded-xl border border-glass-soft bg-surface-subtle/80 px-2.5 py-2 text-[11px] text-slate-200">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Most recent complaint
                </p>
                <p className="line-clamp-1 text-xs font-medium text-slate-50">
                  {mostRecent.title}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono text-emerald-200">
                    {mostRecent.tracking_id}
                  </span>
                  <span>
                    {new Date(mostRecent.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Cinematic Pokhara panel (subtle) */}
          <motion.div
            className="grid grid-cols-[1.1fr_0.9fr] gap-2 rounded-2xl border border-glass-soft bg-surface-deep/90 p-2 shadow-glass-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.24 }}
          >
            <div className="relative h-20 overflow-hidden rounded-xl sm:h-24">
              <Image
                src="/images/pokhara-lakeside.jpg"
                alt="Pokhara city at dusk"
                fill
                sizes="(min-width: 1024px) 220px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-deep via-transparent to-transparent" />
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-surface-deep/95 px-2 py-[2px] text-[9px] text-slate-100">
                Pokhara · City core
              </span>
            </div>
            <div className="flex flex-col justify-between rounded-xl bg-surface-soft/80 px-2.5 py-2 text-[10px] text-slate-200">
              <p className="font-semibold text-emerald-200">
                Your city, your impact
              </p>
              <p className="text-[10px] text-slate-400">
                Every complaint you file helps the municipality prioritize work
                across roads, lighting, waste, and more.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

type HeroBadgeProps = {
  label: string;
  value: number;
  tone: "neutral" | "success" | "warning";
};

function HeroBadge({ label, value, tone }: HeroBadgeProps) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-100"
      : tone === "warning"
      ? "border-amber-400/50 bg-amber-500/10 text-amber-100"
      : "border-slate-500/60 bg-surface-soft text-slate-100";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] ${toneClasses}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-emerald-300 to-sky-300" />
      <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
        {label}
      </span>
      <span className="text-xs font-semibold">{value}</span>
    </span>
  );
}
