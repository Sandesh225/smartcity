// components/citizen/complaints/PriorityBadge.tsx
import type { ComplaintPriority } from '@/app/(citizen)/citizen/complaints/page';

type PriorityBadgeProps = {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
};

export function PriorityBadge({
  priority,
  size = 'md',
}: PriorityBadgeProps) {
  const config = priorityConfig(priority);
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

function priorityConfig(priority: ComplaintPriority) {
  switch (priority) {
    case 'low':
      return {
        label: 'Low',
        className:
          'border-slate-500/40 bg-slate-800/80 text-slate-200',
        dotClass: 'bg-slate-300',
      };
    case 'medium':
      return {
        label: 'Medium',
        className:
          'border-amber-400/50 bg-amber-400/10 text-amber-100',
        dotClass: 'bg-amber-300',
      };
    case 'high':
      return {
        label: 'High',
        className: 'border-orange-500/50 bg-orange-500/10 text-orange-100',
        dotClass: 'bg-orange-400',
      };
    case 'critical':
      return {
        label: 'Critical',
        className: 'border-rose-500/50 bg-rose-500/15 text-rose-100',
        dotClass: 'bg-rose-400',
      };
    default:
      return {
        label: priority,
        className: 'border-slate-600/40 bg-slate-800/60 text-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}
