// components/citizen/complaints/Toolbar.tsx
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Filter,
  LayoutGrid,
  Rows2,
  Sparkles,
  X,
  ChevronRight,
  Search,
} from 'lucide-react';
import type { ComplaintFilters } from '@/app/(citizen)/citizen/complaints/page';

type ToolbarFilterChip = {
  key: keyof ComplaintFilters | 'ward';
  label: string;
};

type SearchSuggestion = {
  id: string;
  tracking_id: string;
  title: string;
};

type ComplaintToolbarProps = {
  title: string;
  description: string;
  totalCount: number;
  filteredCount: number;
  view: 'table' | 'grid';
  density: 'cozy' | 'compact';
  onViewChange: (view: 'table' | 'grid') => void;
  onDensityToggle: () => void;
  onOpenFilters: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  appliedFilters: ToolbarFilterChip[];
  onClearFilter: (key: ToolbarFilterChip['key']) => void;
  onClearAllFilters: () => void;
  searchSuggestions: SearchSuggestion[];
};

export function ComplaintToolbar({
  title,
  description,
  totalCount,
  filteredCount,
  view,
  density,
  onViewChange,
  onDensityToggle,
  onOpenFilters,
  search,
  onSearchChange,
  appliedFilters,
  onClearFilter,
  onClearAllFilters,
  searchSuggestions,
}: ComplaintToolbarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const hasFilters = appliedFilters.length > 0;

  const suggestionMatches = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return searchSuggestions.filter(
      (item) =>
        item.tracking_id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q)
    );
  }, [search, searchSuggestions]);

  return (
    <div className="flex flex-col gap-3 md:gap-3.5">
      {/* Title + primary action */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-200">
            <Sparkles className="h-3 w-3" />
            <span>Citizen complaints</span>
          </div>
          <h1 className="mt-2 text-lg font-semibold text-slate-50 md:text-xl">
            {title}
          </h1>
          <p className="mt-1 text-xs text-slate-400 md:text-sm">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDensityToggle}
            className="hidden items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-300 shadow-[0_0_0_1px_rgba(15,23,42,0.7)] transition hover:border-slate-500 hover:text-slate-100 md:inline-flex"
          >
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            {density === 'cozy' ? 'Cozy view' : 'Compact view'}
          </button>

          <ViewToggle view={view} onChange={onViewChange} />

          <Link
            href="/citizen/complaints/new"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.65)] transition hover:bg-emerald-400"
          >
            <span className="text-base leading-none">＋</span>
            <span>Submit complaint</span>
          </Link>
        </div>
      </div>

      {/* Search + filters row */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-950/90 px-2.5 py-1.5 text-xs text-slate-200 shadow-[0_0_0_1px_rgba(15,23,42,0.85)]">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() =>
                setTimeout(() => {
                  setShowSuggestions(false);
                }, 150)
              }
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by tracking ID or title…"
              className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="rounded-full p-0.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {showSuggestions && suggestionMatches.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-2xl border border-slate-800/80 bg-slate-950/95 p-1.5 text-xs text-slate-200 shadow-[0_26px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <div className="mb-1 px-2 text-[10px] uppercase tracking-[0.15em] text-slate-500">
                Suggestions
              </div>
              <ul className="max-h-48 space-y-0.5 overflow-auto">
                {suggestionMatches.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() =>
                        onSearchChange(item.tracking_id || item.title)
                      }
                      className="flex w-full flex-col items-start rounded-xl px-2 py-1.5 text-left hover:bg-slate-900/80"
                    >
                      <span className="font-mono text-[10px] text-emerald-300">
                        {item.tracking_id}
                      </span>
                      <span className="line-clamp-1 text-[11px] text-slate-100">
                        {item.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 md:justify-end">
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-950/70 px-3 py-1.5 text-[11px] text-slate-200 shadow-[0_0_0_1px_rgba(15,23,42,0.85)] transition hover:border-slate-500 hover:bg-slate-900/80"
          >
            <Filter className="h-3.5 w-3.5 text-emerald-300" />
            <span>Filters</span>
            {hasFilters && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-200">
                {appliedFilters.length}
              </span>
            )}
          </button>

          <div className="hidden items-center gap-2 text-[11px] text-slate-400 md:flex">
            <span>
              Showing{' '}
              <span className="font-medium text-slate-100">
                {filteredCount}
              </span>{' '}
              of{' '}
              <span className="font-medium text-slate-100">{totalCount}</span>{' '}
              complaints
            </span>
          </div>
        </div>
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {appliedFilters.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => onClearFilter(chip.key)}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-100 transition hover:border-emerald-400/70 hover:bg-emerald-500/20"
          >
            <span>{chip.label}</span>
            <X className="h-3 w-3" />
          </button>
        ))}
        {appliedFilters.length > 0 && (
          <button
            type="button"
            onClick={onClearAllFilters}
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-slate-200"
          >
            <span>Clear all</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

type ViewToggleProps = {
  view: 'table' | 'grid';
  onChange: (view: 'table' | 'grid') => void;
};

function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-slate-700/80 bg-slate-950/70 text-[11px] text-slate-300 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]">
      <button
        type="button"
        aria-pressed={view === 'table'}
        onClick={() => onChange('table')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 ${
          view === 'table'
            ? 'bg-slate-900/80 text-slate-50'
            : 'text-slate-400 hover:text-slate-100'
        }`}
      >
        <Rows2 className="h-3.5 w-3.5" />
        Table
      </button>
      <button
        type="button"
        aria-pressed={view === 'grid'}
        onClick={() => onChange('grid')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 ${
          view === 'grid'
            ? 'bg-slate-900/80 text-slate-50'
            : 'text-slate-400 hover:text-slate-100'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Grid
      </button>
    </div>
  );
}
