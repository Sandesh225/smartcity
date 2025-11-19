//components/admin/notices/AdminNoticeStatus
'use client';

import type { FC } from 'react';
import type { NoticeStatus } from './types';

export const AdminNoticeStatusBadge: FC<{ status: NoticeStatus }> = ({ status }) => {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';

  if (status === 'published') {
    return (
      <span className={`${base} bg-emerald-900/50 text-emerald-300`}>Published</span>
    );
  }
  if (status === 'archived') {
    return (
      <span className={`${base} bg-slate-800/70 text-slate-400`}>Archived</span>
    );
  }
  return <span className={`${base} bg-amber-900/50 text-amber-300`}>Draft</span>;
};