// FILE: components/citizen/complaints/detail/WorkUpdates.tsx
"use client";

import type { WorkLogEntry } from "./types";
import { formatDateTime } from "./utils";

interface WorkUpdatesProps {
  logs?: WorkLogEntry[] | null;
}

export function WorkUpdates({ logs }: WorkUpdatesProps) {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const visibleLogs = safeLogs.filter((log) => log.is_visible_to_citizen);

  if (visibleLogs.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-glass-soft bg-surface-elevated/90 p-4 sm:p-5 shadow-glass-md backdrop-blur">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Work updates
        </h2>
      </header>

      <div className="space-y-3 text-sm">
        {visibleLogs.map((log) => (
          <article
            key={log.id}
            className="relative rounded-lg border border-slate-800/70 bg-surface-subtle/80 px-3 py-2.5"
          >
            <div className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-emerald-400/60" />
            <div className="pl-3.5">
              <p className="text-sm text-slate-100">{log.log_content}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {log.created_at ? formatDateTime(log.created_at) : "—"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
