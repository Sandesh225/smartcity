// components/citizen/complaints/FilterDrawer.tsx
import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { X, SlidersHorizontal } from 'lucide-react';
import type {
  ComplaintFilters,
  ComplaintPriority,
  ComplaintStatus,
} from '@/app/(citizen)/citizen/complaints/page';

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  filters: ComplaintFilters;
  onFilterChange: <K extends keyof ComplaintFilters>(
    key: K,
    value: ComplaintFilters[K]
  ) => void;
  onReset: () => void;
  onApply: () => void;
  categories: Array<{ id: string; category_name: string }> | undefined;
  wards: Array<any>;
};

const STATUS_OPTIONS: ComplaintStatus[] = [
  'new',
  'in_progress',
  'resolved',
  'closed',
  'rejected',
];

const PRIORITY_OPTIONS: ComplaintPriority[] = [
  'low',
  'medium',
  'high',
  'critical',
];

export function FilterDrawer({
  open,
  onClose,
  filters,
  onFilterChange,
  onReset,
  onApply,
  categories = [],
  wards = [],
}: FilterDrawerProps) {
  const handleToggleMulti = <K extends keyof ComplaintFilters>(
    key: K,
    value: string
  ) => {
    const current = (filters[key] as string[]) || [];
    if (current.includes(value)) {
      onFilterChange(
        key,
        current.filter((v) => v !== value) as ComplaintFilters[K]
      );
    } else {
      onFilterChange(key, [...current, value] as ComplaintFilters[K]);
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <div className="relative z-30">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm md:bg-black/40"
            onClick={onClose}
          />
        </Transition.Child>

        {/* Panel */}
        <Transition.Child
          as={Fragment}
          enter="transition duration-200 ease-out"
          enterFrom="translate-y-full md:translate-y-0 md:translate-x-full opacity-0"
          enterTo="translate-y-0 md:translate-x-0 opacity-100"
          leave="transition duration-150 ease-in"
          leaveFrom="translate-y-0 md:translate-x-0 opacity-100"
          leaveTo="translate-y-full md:translate-x-full opacity-0"
        >
          <div className="fixed inset-x-0 bottom-0 max-h-[80vh] rounded-t-3xl border border-slate-800/80 bg-slate-950/95 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] md:inset-y-0 md:right-0 md:w-full md:max-w-md md:rounded-l-3xl md:rounded-tr-none">
            <div className="flex h-full flex-col">
              <header className="flex items-center justify-between gap-3 border-b border-slate-800/80 px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                      Filters
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Refine your complaints list
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-slate-700/70 bg-slate-900/70 p-1 text-slate-400 hover:border-slate-500 hover:text-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3 text-xs text-slate-200 md:px-5 md:py-4">
                {/* Status */}
                <section>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Status
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((status) => (
                      <FilterPill
                        key={status}
                        label={statusLabel(status)}
                        active={filters.status?.includes(status)}
                        onClick={() => handleToggleMulti('status', status)}
                      />
                    ))}
                  </div>
                </section>

                {/* Priority */}
                <section>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Priority
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {PRIORITY_OPTIONS.map((priority) => (
                      <FilterPill
                        key={priority}
                        label={priorityLabel(priority)}
                        active={filters.priority?.includes(priority)}
                        onClick={() => handleToggleMulti('priority', priority)}
                      />
                    ))}
                  </div>
                </section>

                {/* Category */}
                <section>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Category
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <FilterPill
                        key={cat.id}
                        label={cat.category_name}
                        active={filters.category?.includes(cat.id)}
                        onClick={() => handleToggleMulti('category', cat.id)}
                      />
                    ))}
                  </div>
                </section>

                {/* Ward */}
                {wards.length > 0 && (
                  <section>
                    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Ward
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {wards.map((ward: any) => {
                        const id =
                          String(ward.id ?? ward.ward_id ?? ward.ward_number);
                        const label =
                          ward.name ??
                          ward.display_name ??
                          `Ward ${ward.ward_number ?? id}`;
                        return (
                          <FilterPill
                            key={id}
                            label={label}
                            active={filters.ward?.includes(id)}
                            onClick={() => handleToggleMulti('ward', id)}
                          />
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Date range */}
                <section>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Date range
                  </h3>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">
                        From
                      </label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) =>
                          onFilterChange('dateFrom', e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-[11px] text-slate-100 outline-none ring-0 focus:border-emerald-500/70"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">To</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) =>
                          onFilterChange('dateTo', e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-[11px] text-slate-100 outline-none ring-0 focus:border-emerald-500/70"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <footer className="border-t border-slate-800/80 px-4 py-3 md:px-5">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={onReset}
                    className="text-slate-400 hover:text-slate-100"
                  >
                    Reset all
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-200 hover:border-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={onApply}
                      className="rounded-full bg-emerald-500 px-3.5 py-1.5 text-[11px] font-semibold text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.7)] hover:bg-emerald-400"
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
}

type FilterPillProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
};

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${
        active
          ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100'
          : 'border-slate-700/80 bg-slate-950/80 text-slate-300 hover:border-slate-500 hover:text-slate-100'
      }`}
    >
      {label}
    </button>
  );
}

function statusLabel(status: ComplaintStatus): string {
  switch (status) {
    case 'new':
      return 'New';
    case 'in_progress':
      return 'In progress';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
}

function priorityLabel(priority: ComplaintPriority): string {
  switch (priority) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
    default:
      return priority;
  }
}
