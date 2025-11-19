// components/citizen/complaints/EmptyState.tsx
import Link from 'next/link';
import { Inbox } from 'lucide-react';

type EmptyStateProps = {
  hasFilters: boolean;
  onResetFilters?: () => void;
};

export function EmptyState({ hasFilters, onResetFilters }: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/80 px-4 py-10 text-center text-xs text-slate-300">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/90 text-slate-500 shadow-[0_18px_50px_rgba(0,0,0,0.85)]">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-slate-50">
        {hasFilters ? 'No complaints match your filters' : 'No complaints yet'}
      </h3>
      <p className="mb-4 max-w-sm text-[11px] text-slate-400">
        {hasFilters
          ? 'Try adjusting or clearing your filters to see more complaints.'
          : 'When you submit a complaint, you will be able to track its progress here in real time.'}
      </p>

      {hasFilters ? (
        onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-[11px] text-slate-200 transition hover:border-emerald-500/60 hover:text-emerald-100"
          >
            Clear filters
          </button>
        )
      ) : (
        <Link
          href="/citizen/complaints/new"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.7)] hover:bg-emerald-400"
        >
          <span className="text-base leading-none">＋</span>
          <span>Submit your first complaint</span>
        </Link>
      )}
    </div>
  );
}
