'use client';

import { useMemo, useState } from 'react';
import type { Complaint } from '@/hooks/useCitizenComplaints';

type Props = {
  complaints: Complaint[];
  loading: boolean;
  onSelect: (id: string) => void;
  language: 'en' | 'np';
};

function statusLabel(status: Complaint['status'], language: 'en' | 'np') {
  const labels: Record<Complaint['status'], Record<'en' | 'np', string>> = {
    new: { en: 'New', np: 'नयाँ' },
    in_progress: { en: 'In Progress', np: 'प्रक्रियामा' },
    resolved: { en: 'Resolved', np: 'समाधान भएको' },
    closed: { en: 'Closed', np: 'बन्द' },
  };
  return labels[status][language];
}

export function MyComplaintsList({
  complaints,
  loading,
  onSelect,
  language,
}: Props) {
  const [filter, setFilter] = useState<Complaint['status'] | 'all'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return complaints;
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="filter-pills">
        <button
          className="filter-pill"
          data-active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          {language === 'en' ? 'All' : 'सबै'} ({complaints.length})
        </button>

        {(['new', 'in_progress', 'resolved', 'closed'] as const).map(
          (status) => {
            const count = complaints.filter((c) => c.status === status).length;
            return (
              <button
                key={status}
                className="filter-pill"
                data-active={filter === status}
                onClick={() => setFilter(status)}
              >
                {statusLabel(status, language)} {count > 0 && `(${count})`}
              </button>
            );
          }
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">
            {filter === 'all'
              ? language === 'en'
                ? 'No complaints yet'
                : 'अभी कुनै गुनासो नै छैन'
              : language === 'en'
              ? 'No complaints in this status'
              : 'यो अवस्थामा कुनै गुनासो नै छैन'}
          </p>
          {filter === 'all' && (
            <p className="empty-state-description">
              {language === 'en'
                ? 'Submit your first complaint to get started'
                : 'तपाईंको पहिलो गुनासो जमा गर्न सुरु गर्नुहोस्'}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="complaint-card w-full text-left transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                {/* Status dot */}
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                    c.status === 'resolved'
                      ? 'bg-emerald-400'
                      : c.status === 'in_progress'
                      ? 'bg-amber-300'
                      : c.status === 'closed'
                      ? 'bg-slate-400'
                      : 'bg-sky-400'
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <h3 className="complaint-card-title">{c.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="tracking-id text-xs text-muted-foreground font-mono">
                      {c.tracking_id}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`status-badge status-${c.status.replace('_', '-')}`}
                  >
                    {statusLabel(c.status, language)}
                  </div>
                  {c.is_overdue && (
                    <div className="status-badge status-overdue text-xs font-bold">
                      ⚠️ {language === 'en' ? 'Overdue' : 'समयबाहिर'}
                    </div>
                  )}
                  <div className={`priority-badge priority-${c.priority}`}>
                    {c.priority}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
