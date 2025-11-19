// FILE: components/citizen/dashboard/EmptyDashboard.tsx
'use client';

import Link from "next/link";
import { FileText, Stars } from "lucide-react";

export default function EmptyDashboard() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-dashed border-glass-soft bg-surface-elevated/90 px-4 py-8 text-center shadow-glass-md sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-x-1/4 top-[-3rem] h-32 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="absolute left-[-4rem] bottom-[-4rem] h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-soft text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.65)]">
          <Stars className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
            No complaints yet – your dashboard is ready
          </h2>
          <p className="mt-2 text-[11px] text-slate-400 sm:text-xs">
            Once you submit complaints, you’ll see live stats, resolution
            progress, and a history of how you’ve helped improve Pokhara.
          </p>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Link
            href="/citizen/complaints/new"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.7)] hover:brightness-110"
          >
            <FileText className="h-4 w-4" />
            <span>Submit your first complaint</span>
          </Link>
          <Link
            href="/citizen/complaints"
            className="inline-flex items-center rounded-full border border-glass-soft bg-surface-subtle px-3 py-2 text-[11px] text-slate-100 hover:border-emerald-400/70"
          >
            Browse complaint history
          </Link>
        </div>
      </div>
    </section>
  );
}
