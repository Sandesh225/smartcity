// components/citizen/complaints/Grid.tsx
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Complaint } from '@/app/(citizen)/citizen/complaints/page';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

type ComplaintGridProps = {
  complaints: Complaint[];
  categoryMap: Record<string, string>;
};

export function ComplaintGrid({ complaints, categoryMap }: ComplaintGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {complaints.map((c) => (
        <article
          key={c.id}
          className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-slate-950/95 p-3.5 text-xs text-slate-200 shadow-[0_18px_60px_rgba(0,0,0,0.9)]"
        >
          <div
            className={`absolute inset-x-0 top-0 h-0.5 ${
              statusTopBarClass(c.status)
            }`}
          />

          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-full border border-slate-700/80 bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] text-slate-300">
              {c.tracking_id}
            </span>
            <PriorityBadge priority={c.priority} size="sm" />
          </div>

          <h3 className="mb-1.5 line-clamp-2 text-[13px] font-semibold text-slate-50">
            {c.title}
          </h3>

          <div className="mb-2 flex items-center justify-between gap-2">
            <StatusBadge status={c.status} size="sm" />
            <span className="line-clamp-1 text-[11px] text-slate-400">
              {categoryMap[c.category_id] ?? 'Uncategorized'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
            <span>
              Created {new Date(c.created_at).toLocaleDateString()}
            </span>
            <span>
              Updated {new Date(c.updated_at).toLocaleDateString()}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <Link
              href={`/citizen/complaints/${c.id}`}
              className="inline-flex items-center gap-1 rounded-full border border-transparent bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.65)] transition group-hover:bg-emerald-400"
            >
              <span>View details</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <div className="flex gap-1.5 text-[10px] text-slate-400">
              <span className="rounded-full bg-slate-900/80 px-2 py-0.5">
                #{c.id.slice(0, 6)}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function statusTopBarClass(status: Complaint['status']): string {
  switch (status) {
    case 'new':
      return 'bg-emerald-500/80';
    case 'in_progress':
      return 'bg-sky-500/80';
    case 'resolved':
      return 'bg-emerald-400/80';
    case 'closed':
      return 'bg-slate-500/80';
    case 'rejected':
      return 'bg-rose-500/80';
    default:
      return 'bg-slate-700/80';
  }
}
