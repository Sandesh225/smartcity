// FILE: components/citizen/dashboard/InsightCard.tsx
'use client';

import { LucideIcon } from "lucide-react";

type Accent = "neutral" | "success" | "warning";

type InsightCardProps = {
  title: string;
  metric: number | string;
  subtitle: string;
  footer?: string;
  icon: LucideIcon;
  accent?: Accent;
};

export default function InsightCard({
  title,
  metric,
  subtitle,
  footer,
  icon: Icon,
  accent = "neutral",
}: InsightCardProps) {
  const accentRing =
    accent === "success"
      ? "ring-emerald-500/50"
      : accent === "warning"
      ? "ring-amber-400/50"
      : "ring-slate-500/40";

  const accentIconBg =
    accent === "success"
      ? "bg-emerald-500/15 text-emerald-200"
      : accent === "warning"
      ? "bg-amber-500/15 text-amber-200"
      : "bg-slate-700/40 text-slate-100";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-glass-soft bg-surface-deep/90 p-3.5 text-xs text-slate-200 shadow-glass-sm">
      <div className="absolute inset-0 opacity-60">
        <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-emerald-500/8 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium text-slate-300">{title}</p>
            <p className="mt-1 text-lg font-semibold text-slate-50 sm:text-xl">
              {metric}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>
          </div>
          <div
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-glass-soft ${accentIconBg} ring-1 ${accentRing}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {footer && (
          <div className="mt-1 rounded-xl bg-surface-subtle/90 px-2.5 py-1.5 text-[11px] text-slate-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
