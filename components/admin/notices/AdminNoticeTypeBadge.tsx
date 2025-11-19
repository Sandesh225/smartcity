// components/admin/notices/AdminNoticeTypeBadge.tsx
'use client';

import type { FC } from 'react';
import type { NoticeType } from './types';

export const AdminNoticeTypeBadge: FC<{ type: NoticeType }> = ({ type }) => {
  const base =
    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border';

  const map: Record<
    NoticeType,
    { label: string; className: string }
  > = {
    general: {
      label: 'General',
      className: 'border-slate-700 text-slate-300 bg-slate-900/40',
    },
    tender: {
      label: 'Tender',
      className: 'border-blue-700 text-blue-300 bg-blue-950/40',
    },
    public_hearing: {
      label: 'Public Hearing',
      className: 'border-amber-700 text-amber-300 bg-amber-950/40',
    },
    emergency: {
      label: 'Emergency',
      className: 'border-red-700 text-red-300 bg-red-950/40',
    },
    event: {
      label: 'Event',
      className: 'border-purple-700 text-purple-300 bg-purple-950/40',
    },
  };

  const style = map[type];

  return <span className={`${base} ${style.className}`}>{style.label}</span>;
};
