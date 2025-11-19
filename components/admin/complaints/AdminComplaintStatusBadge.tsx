// components/admin/complaints/AdminComplaintStatusBadge.tsx
'use client';

import type { FC } from 'react';
import type { ComplaintStatus } from './types';

export const AdminComplaintStatusBadge: FC<{ status: ComplaintStatus }> = ({
  status,
}) => {
  const base =
    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium';

  const map: Record<ComplaintStatus, string> = {
    new: 'bg-sky-900/60 text-sky-200',
    in_review: 'bg-amber-900/60 text-amber-200',
    in_progress: 'bg-emerald-900/60 text-emerald-200',
    resolved: 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/70',
    closed: 'bg-slate-900/70 text-slate-300 border border-slate-700/70',
    rejected: 'bg-rose-900/60 text-rose-200',
  };

  const labelMap: Record<ComplaintStatus, string> = {
    new: 'New',
    in_review: 'In review',
    in_progress: 'In progress',
    resolved: 'Resolved',
    closed: 'Closed',
    rejected: 'Rejected',
  };

  return (
    <span className={`${base} ${map[status]}`}>{labelMap[status]}</span>
  );
};
