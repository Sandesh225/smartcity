// components/citizen/complaints/Table.tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Complaint } from '@/app/(citizen)/citizen/complaints/page';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

type ComplaintTableProps = {
  complaints: Complaint[];
  density: 'cozy' | 'compact';
  categoryMap: Record<string, string>;
  onHoverComplaint?: (complaint: Complaint | null) => void;
};

export function ComplaintTable({
  complaints,
  density,
  categoryMap,
  onHoverComplaint,
}: ComplaintTableProps) {
  const isCompact = density === 'compact';

  return (
    <div className="relative overflow-x-auto">
      <table
        className={`w-full table-fixed border-separate border-spacing-0 text-[11px] md:text-xs`}
      >
        <thead>
          <tr className="sticky top-0 z-10 bg-slate-950/95 text-[10px] uppercase tracking-[0.14em] text-slate-500 backdrop-blur-xl">
            <Th className="w-[140px]">Tracking</Th>
            <Th>Title</Th>
            <Th className="w-[120px]">Status</Th>
            <Th className="w-[110px]">Priority</Th>
            <Th className="w-[140px]">Category</Th>
            <Th className="w-[130px]">Created</Th>
            <Th className="w-[72px] text-right">Open</Th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c, idx) => (
            <tr
              key={c.id}
              onMouseEnter={() => onHoverComplaint?.(c)}
              onMouseLeave={() => onHoverComplaint?.(null)}
              className="group"
            >
              <Td
                isFirst
                isCompact={isCompact}
                className="font-mono text-[10px] text-emerald-200"
              >
                {c.tracking_id}
              </Td>
              <Td isCompact={isCompact} className="w-[260px] md:w-[360px]">
                <div className="flex flex-col gap-0.5">
                  <span className="line-clamp-1 text-[11px] font-medium text-slate-50 md:text-xs">
                    {c.title}
                  </span>
                  <span className="hidden text-[10px] text-slate-500 md:inline">
                    Updated {new Date(c.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </Td>
              <Td isCompact={isCompact}>
                <StatusBadge status={c.status} />
              </Td>
              <Td isCompact={isCompact}>
                <PriorityBadge priority={c.priority} />
              </Td>
              <Td isCompact={isCompact}>
                <span className="line-clamp-1 text-[11px] text-slate-300">
                  {categoryMap[c.category_id] ?? 'Uncategorized'}
                </span>
              </Td>
              <Td isCompact={isCompact}>
                {new Date(c.created_at).toLocaleDateString()}
              </Td>
              <Td isCompact={isCompact} className="text-right">
                <Link
                  href={`/citizen/complaints/${c.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-[10px] text-emerald-300 transition group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 group-hover:text-emerald-100"
                >
                  <span>Open</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ThProps = {
  children: React.ReactNode;
  className?: string;
};

function Th({ children, className = '' }: ThProps) {
  return (
    <th
      className={`border-b border-slate-800 px-3 py-2 text-left text-[10px] font-medium ${className}`}
    >
      {children}
    </th>
  );
}

type TdProps = {
  children: React.ReactNode;
  isFirst?: boolean;
  isCompact?: boolean;
  className?: string;
};

function Td({ children, isFirst, isCompact, className = '' }: TdProps) {
  return (
    <td
      className={`border-b border-slate-900/80 bg-slate-950/70 px-3 ${
        isCompact ? 'py-1.5' : 'py-2.5'
      } ${
        isFirst
          ? 'rounded-l-xl border-l border-slate-900/80 pl-3.5'
          : 'border-l border-slate-900/80'
      } last-of-type:rounded-r-xl last-of-type:border-r group-hover:bg-slate-900/80 ${className}`}
    >
      {children}
    </td>
  );
}
