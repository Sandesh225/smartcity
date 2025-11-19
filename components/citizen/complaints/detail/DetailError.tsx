// FILE: components/citizen/complaints/detail/DetailError.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface DetailErrorProps {
  message: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
}

export function DetailError({ message, onRetry, showHomeLink }: DetailErrorProps) {
  return (
    <section className="rounded-2xl border border-rose-500/40 bg-rose-950/70 px-4 py-8 sm:px-6 shadow-glass-md backdrop-blur">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20">
          <AlertTriangle className="h-6 w-6 text-rose-300" />
        </div>
        <h2 className="mb-1 text-sm font-semibold text-slate-50 sm:text-base">
          Something went wrong
        </h2>
        <p className="mb-5 text-xs text-slate-200/80 sm:text-sm">
          {message}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/60 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-100 shadow-sm transition hover:border-rose-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try again</span>
            </button>
          )}
          <Link
            href="/citizen/complaints"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-soft/90 px-3 py-1.5 text-xs text-slate-100 transition hover:border-emerald-400/60 hover:text-emerald-100"
          >
            ← Back to complaints
          </Link>
        </div>
      </div>
    </section>
  );
}
