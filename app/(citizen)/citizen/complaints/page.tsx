// app/(citizen)/citizen/complaints/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCitizenComplaints } from "@/hooks/useCitizenComplaints";
import { useComplaintFilters } from "@/hooks/useComplaintFilters";
import { useComplaintCategories } from "@/hooks/useComplaintCategories";
import { useWards } from "@/hooks/useWards";

import { ComplaintToolbar } from "@/components/citizen/complaints/Toolbar";
import { FilterDrawer } from "@/components/citizen/complaints/FilterDrawer";
import { ComplaintTable } from "@/components/citizen/complaints/Table";
import { ComplaintGrid } from "@/components/citizen/complaints/Grid";
import { EmptyState } from "@/components/citizen/complaints/EmptyState";
import { LoadingSkeleton } from "@/components/citizen/complaints/LoadingSkeleton";
import { ErrorBanner } from "@/components/citizen/complaints/ErrorBanner";

export type ComplaintStatus =
  | "new"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected";
export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export type Complaint = {
  id: string;
  title: string;
  tracking_id: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  category_id: string;
  created_at: string;
  updated_at: string;
};

export type ComplaintFilters = {
  search: string;
  status: ComplaintStatus[];
  priority: ComplaintPriority[];
  category: string[];
  ward?: string[];
  dateFrom: string;
  dateTo: string;
};

const PAGE_SIZE = 20;

export default function CitizenComplaintsPage() {
  const { user } = useAuth();
  const [pageIndex, setPageIndex] = useState(0);
  const [view, setView] = useState<"table" | "grid">("table");
  const [density, setDensity] = useState<"cozy" | "compact">("cozy");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hoveredComplaint, setHoveredComplaint] = useState<Complaint | null>(
    null
  );

  const { complaints, loading, hasMore, error } = useCitizenComplaints(
    user?.id || null,
    PAGE_SIZE,
    pageIndex
  );

  const safeComplaints: Complaint[] = complaints ?? [];

  const filtersApi = useComplaintFilters(safeComplaints);
  const { filters, filtered, updateFilter, resetFilters } = filtersApi as {
    filters: ComplaintFilters;
    filtered: Complaint[];
    updateFilter: <K extends keyof ComplaintFilters>(
      key: K,
      value: ComplaintFilters[K]
    ) => void;
    resetFilters: () => void;
  };

  const { categories } = useComplaintCategories();
  const wardsApi = useWards() as any;
  const wards = wardsApi?.wards ?? [];

  const categoryMap = useMemo(
    () =>
      (categories || []).reduce((acc: Record<string, string>, c: any) => {
        acc[c.id] = c.category_name;
        return acc;
      }, {}),
    [categories]
  );

  // Default to grid on small screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setView("grid");
      setDensity("cozy");
    }
  }, []);

  const isInitialLoading = loading && safeComplaints.length === 0;
  const hasFiltersApplied =
    !!filters.search ||
    (filters.status && filters.status.length > 0) ||
    (filters.priority && filters.priority.length > 0) ||
    (filters.category && filters.category.length > 0) ||
    (filters.ward && filters.ward.length > 0) ||
    !!filters.dateFrom ||
    !!filters.dateTo;

  const appliedFilterChips = useMemo(() => {
    const chips: Array<{
      key: keyof ComplaintFilters | "ward";
      label: string;
    }> = [];
    if (filters.search)
      chips.push({ key: "search", label: `Search: ${filters.search}` });
    if (filters.status?.length)
      chips.push({ key: "status", label: `Status: ${filters.status.length}` });
    if (filters.priority?.length)
      chips.push({
        key: "priority",
        label: `Priority: ${filters.priority.length}`,
      });
    if (filters.category?.length)
      chips.push({
        key: "category",
        label: `Category: ${filters.category.length}`,
      });
    if (filters.ward?.length)
      chips.push({ key: "ward", label: `Ward: ${filters.ward.join(", ")}` });
    if (filters.dateFrom)
      chips.push({ key: "dateFrom", label: `From: ${filters.dateFrom}` });
    if (filters.dateTo)
      chips.push({ key: "dateTo", label: `To: ${filters.dateTo}` });
    return chips;
  }, [filters]);

  const searchSuggestions = useMemo(
    () =>
      safeComplaints.slice(0, 20).map((c) => ({
        id: c.id,
        tracking_id: c.tracking_id,
        title: c.title,
      })),
    [safeComplaints]
  );

  const handleClearChip = (key: keyof ComplaintFilters | "ward") => {
    if (key === "search")
      updateFilter("search", "" as ComplaintFilters["search"]);
    if (key === "status")
      updateFilter("status", [] as ComplaintFilters["status"]);
    if (key === "priority")
      updateFilter("priority", [] as ComplaintFilters["priority"]);
    if (key === "category")
      updateFilter("category", [] as ComplaintFilters["category"]);
    if (key === "ward") updateFilter("ward", [] as ComplaintFilters["ward"]);
    if (key === "dateFrom")
      updateFilter("dateFrom", "" as ComplaintFilters["dateFrom"]);
    if (key === "dateTo")
      updateFilter("dateTo", "" as ComplaintFilters["dateTo"]);
  };

  const handleRetry = () => {
    // Simple, robust retry: reset pagination and reload
    setPageIndex(0);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <main className="space-y-4 md:space-y-6">
      {/* Top glassy shell */}
      <section className="rounded-2xl border border-white/5 bg-slate-950/70 px-3 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.75)] backdrop-blur-xl md:px-5 md:py-4">
        <ComplaintToolbar
          title="My complaints"
          description="Search, filter, and track the issues you have reported to Pokhara Metropolitan City."
          totalCount={safeComplaints.length}
          filteredCount={filtered.length}
          view={view}
          density={density}
          onViewChange={setView}
          onDensityToggle={() =>
            setDensity((prev) => (prev === "cozy" ? "compact" : "cozy"))
          }
          onOpenFilters={() => setFiltersOpen(true)}
          search={filters.search}
          onSearchChange={(value) => updateFilter("search", value)}
          appliedFilters={appliedFilterChips}
          onClearFilter={handleClearChip}
          onClearAllFilters={resetFilters}
          searchSuggestions={searchSuggestions}
        />
      </section>

      {/* Filter drawer */}
      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        onApply={() => setFiltersOpen(false)}
        categories={categories}
        wards={wards}
      />

      {/* Error banner (non-blocking) */}
      {error && (
        <ErrorBanner
          message="We couldn’t load your complaints right now."
          onRetry={handleRetry}
        />
      )}

      {/* Content shell */}
      <section className="rounded-2xl border border-white/5 bg-slate-950/70 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.75)] backdrop-blur-xl md:p-4 lg:p-5">
        {isInitialLoading ? (
          <LoadingSkeleton variant={view} density={density} />
        ) : filtered.length === 0 ? (
          <EmptyState
            hasFilters={hasFiltersApplied}
            onResetFilters={hasFiltersApplied ? resetFilters : undefined}
          />
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 overflow-hidden">
              {view === "table" ? (
                <ComplaintTable
                  complaints={filtered}
                  density={density}
                  categoryMap={categoryMap}
                  onHoverComplaint={setHoveredComplaint}
                />
              ) : (
                <ComplaintGrid
                  complaints={filtered}
                  categoryMap={categoryMap}
                />
              )}

              {hasMore && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setPageIndex((p) => p + 1)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/5 px-4 py-1.5 text-xs font-medium text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.15)] transition hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Loading more…" : "Load more"}
                  </button>
                </div>
              )}
            </div>

            {/* Quick peek side panel (desktop only, table view only) */}
            {view === "table" && (
              <aside className="hidden w-full max-w-xs shrink-0 lg:block">
                <QuickPeekPanel
                  complaint={hoveredComplaint}
                  categoryMap={categoryMap}
                />
              </aside>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

type QuickPeekPanelProps = {
  complaint: Complaint | null;
  categoryMap: Record<string, string>;
};

function QuickPeekPanel({ complaint, categoryMap }: QuickPeekPanelProps) {
  if (!complaint) {
    return (
      <div className="h-full rounded-2xl border border-white/5 bg-slate-950/80 p-4 text-xs text-slate-500">
        <p className="mb-1 font-medium text-slate-300">Quick preview</p>
        <p>Select a complaint row to see a quick summary here.</p>
      </div>
    );
  }

  const categoryName = categoryMap[complaint.category_id] ?? "Uncategorized";

  return (
    <div className="h-full rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950/90 p-4 text-xs text-slate-200 shadow-[0_22px_70px_rgba(0,0,0,0.9)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-200">
          {complaint.tracking_id}
        </span>
        <span className="rounded-full border border-slate-700/60 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300">
          {categoryName}
        </span>
      </div>
      <h3 className="mb-2 line-clamp-3 text-[13px] font-semibold text-slate-50">
        {complaint.title}
      </h3>
      <dl className="space-y-1.5 text-[11px] text-slate-400">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Created</dt>
          <dd>{new Date(complaint.created_at).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Last updated</dt>
          <dd>{new Date(complaint.updated_at).toLocaleString()}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <Link
          href={`/citizen/complaints/${complaint.id}`}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-medium text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.65)] transition hover:bg-emerald-400"
        >
          Open full details
        </Link>
      </div>
    </div>
  );
}
