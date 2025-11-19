// components/citizen/complaints/StatusBadge.tsx
import type { ComplaintStatus } from '@/app/(citizen)/citizen/complaints/page';

type StatusBadgeProps = {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig(status);
  const baseSize =
    size === 'sm'
      ? 'px-1.5 py-0.5 text-[10px]'
      : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${baseSize} ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}

function statusConfig(status: ComplaintStatus) {
  switch (status) {
    case 'new':
      return {
        label: 'New',
        className:
          'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
        dotClass: 'bg-emerald-400',
      };
    case 'in_progress':
      return {
        label: 'In progress',
        className: 'border-sky-500/40 bg-sky-500/10 text-sky-100',
        dotClass: 'bg-sky-400',
      };
    case 'resolved':
      return {
        label: 'Resolved',
        className:
          'border-emerald-400/50 bg-emerald-400/10 text-emerald-100',
        dotClass: 'bg-emerald-300',
      };
    case 'closed':
      return {
        label: 'Closed',
        className: 'border-slate-500/40 bg-slate-500/10 text-slate-200',
        dotClass: 'bg-slate-400',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'border-rose-500/40 bg-rose-500/10 text-rose-100',
        dotClass: 'bg-rose-400',
      };
    default:
      return {
        label: status,
        className: 'border-slate-600/40 bg-slate-800/60 text-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}
