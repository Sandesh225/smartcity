// FILE: components/citizen/complaints/detail/StatusTimeline.tsx
"use client";

import type { StatusHistoryEntry } from "./types";
import { formatDateTime, formatStatusLabel } from "./utils";

interface StatusTimelineProps {
  history?: StatusHistoryEntry[] | null;
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  const safeHistory = Array.isArray(history) ? history : [];

  return (
    <section className="rounded-2xl border border-glass-soft bg-surface-elevated/90 p-4 sm:p-5 shadow-glass-md backdrop-blur">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Status timeline
        </h2>
      </header>

      {safeHistory.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-500">
          No status updates have been recorded yet.
        </p>
      ) : (
        <div className="relative max-h-80 space-y-4 overflow-auto pr-1">
          {/* Vertical line */}
          <div className="pointer-events-none absolute left-3 top-0 bottom-0 w-px bg-slate-800/80" />
          {safeHistory.map((item, index) => {
            const isLatest = index === 0;
            return (
              <div
                key={item.id ?? `${item.to_status}-${index}`}
                className="relative flex gap-3 pl-6"
              >
                {/* Dot */}
                <div className="absolute left-0 top-1.5 flex h-3 w-3 items-center justify-center">
                  <span
                    className={[
                      "h-2 w-2 rounded-full",
                      isLatest
                        ? "bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.35)]"
                        : "bg-slate-500",
                    ].join(" ")}
                  />
                </div>

                <div className="flex-1 space-y-0.5 pb-3">
                  <p
                    className={[
                      "text-xs font-medium",
                      isLatest ? "text-slate-50" : "text-slate-200",
                    ].join(" ")}
                  >
                    {formatStatusLabel(item.to_status)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.changed_at ? formatDateTime(item.changed_at) : "—"}
                  </p>
                  {item.notes && (
                    <p className="pt-1 text-[11px] leading-relaxed text-slate-300">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
