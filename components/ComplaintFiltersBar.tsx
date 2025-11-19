
// =====================================================================
// components/ComplaintFiltersBar.tsx
// Advanced filters with URL sync
// =====================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

interface FiltersBarProps {
  categories: Array<{ id: string; category_name: string }>;
  wards: Array<{ id: string; ward_number: number; ward_name: string }>;
  language: 'en' | 'np';
}

export function ComplaintFiltersBar({
  categories,
  wards,
  language,
}: FiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statuses, setStatuses] = useState<string[]>(
    (searchParams.get('statuses') || '').split(',').filter(Boolean)
  );
  const [priorities, setPriorities] = useState<string[]>(
    (searchParams.get('priorities') || '').split(',').filter(Boolean)
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statuses.length) params.set('statuses', statuses.join(','));
    if (priorities.length) params.set('priorities', priorities.join(','));
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    router.push(`?${params.toString()}`);
  }, [search, statuses, priorities, dateFrom, dateTo]);

  const reset = () => {
    setSearch('');
    setStatuses([]);
    setPriorities([]);
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="card space-y-4">
      <div>
        <label className="text-xs font-medium text-slate-200 mb-2 block">
          {language === 'en' ? 'Search' : 'खोज'}
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === 'en' ? 'Tracking ID or title...' : 'ट्र्याकिङ ID...'}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-200 mb-2 block">
            {language === 'en' ? 'Status' : 'स्थिति'}
          </label>
          <select
            multiple
            value={statuses}
            onChange={(e) =>
              setStatuses(Array.from(e.target.selectedOptions, (o) => o.value))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="new">
              {language === 'en' ? 'New' : 'नयाँ'}
            </option>
            <option value="in_progress">
              {language === 'en' ? 'In Progress' : 'प्रक्रियामा'}
            </option>
            <option value="resolved">
              {language === 'en' ? 'Resolved' : 'समाधान भएको'}
            </option>
            <option value="closed">
              {language === 'en' ? 'Closed' : 'बन्द'}
            </option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-200 mb-2 block">
            {language === 'en' ? 'Priority' : 'प्राथमिकता'}
          </label>
          <select
            multiple
            value={priorities}
            onChange={(e) =>
              setPriorities(Array.from(e.target.selectedOptions, (o) => o.value))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="low">{language === 'en' ? 'Low' : 'कम'}</option>
            <option value="medium">
              {language === 'en' ? 'Medium' : 'मध्यम'}
            </option>
            <option value="high">{language === 'en' ? 'High' : 'उच्च'}</option>
            <option value="critical">
              {language === 'en' ? 'Critical' : 'गम्भीर'}
            </option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-200 mb-2 block">
            {language === 'en' ? 'From Date' : 'मितिबाट'}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-200 mb-2 block">
            {language === 'en' ? 'To Date' : 'मितिसम्म'}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {(search || statuses.length || priorities.length || dateFrom || dateTo) && (
        <button
          onClick={reset}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200"
        >
          <X className="w-3 h-3" />
          {language === 'en' ? 'Clear filters' : 'फिल्टर हटाउनुहोस्'}
        </button>
      )}
    </div>
  );
}