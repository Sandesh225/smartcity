// =====================================================================
// PART 2: COMPLAINT LIST PAGE
// =====================================================================

// app/(citizen)/citizen/complaints/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCitizenComplaints } from '@/hooks/useCitizenComplaints';
import { useComplaintFilters } from '@/hooks/useComplaintFilters';
import { useComplaintCategories } from '@/hooks/useComplaintCategories';
import { useWards } from '@/hooks/useWards';
import Link from 'next/link';

export default function CitizenComplaintsPage() {
  const { user } = useAuth();
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 20;

  const { complaints, loading, hasMore } = useCitizenComplaints(
    user?.id || null,
    pageSize,
    pageIndex
  );

  const { filters, filtered, updateFilter, resetFilters } = useComplaintFilters(complaints);
  const { categories } = useComplaintCategories();
  const { wards } = useWards();

  if (loading && pageIndex === 0) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">My Complaints</h1>
            <p className="card-subtitle">
              View and track all your submitted complaints
            </p>
          </div>
          <Link
            href="/citizen/complaints/new"
            className="btn-primary"
          >
            + Submit New Complaint
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="card">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="text-xs font-medium text-slate-200 mb-1.5 block">
              Search by ID or title
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="PKR-20250101-12345 or pothole..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Status Filter */}
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                Status
              </label>
              <select
                multiple
                value={filters.status}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                  updateFilter('status', selected);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                Category
              </label>
              <select
                multiple
                value={filters.category}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                  updateFilter('category', selected);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                Priority
              </label>
              <select
                multiple
                value={filters.priority}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                  updateFilter('priority', selected);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Date From */}
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="btn-secondary text-xs"
            >
              Reset Filters
            </button>
            <span className="text-xs text-slate-400 self-center">
              Showing {filtered.length} of {complaints.length} complaints
            </span>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="card">
        {filtered.length === 0 ? (
          <EmptyState
            hasFilters={
              filters.search ||
              filters.status.length > 0 ||
              filters.category.length > 0 ||
              filters.priority.length > 0
            }
          />
        ) : (
          <ComplaintTable complaints={filtered} />
        )}
      </section>

      {/* Pagination */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPageIndex((p) => p + 1)}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

function ComplaintTable({ complaints }: { complaints: any[] }) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Tracking ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.id}>
              <td className="font-mono text-xs">{c.tracking_id}</td>
              <td>{c.title}</td>
              <td>
                <StatusBadge status={c.status} />
              </td>
              <td>
                <PriorityBadge priority={c.priority} />
              </td>
              <td className="text-xs text-slate-400">
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              <td>
                <Link
                  href={`/citizen/complaints/${c.id}`}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  View Details →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    new: { label: 'New', class: 'badge-status new' },
    in_progress: { label: 'In Progress', class: 'badge-status in-progress' },
    resolved: { label: 'Resolved', class: 'badge-status resolved' },
    closed: { label: 'Closed', class: 'badge-status closed' },
    rejected: { label: 'Rejected', class: 'badge-status closed' },
  };

  const { label, class: className } = config[status as keyof typeof config] || config.new;

  return (
    <span className={className}>
      <span className="badge-dot" />
      <span>{label}</span>
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config = {
    low: { label: 'Low', class: 'badge-priority low' },
    medium: { label: 'Medium', class: 'badge-priority medium' },
    high: { label: 'High', class: 'badge-priority high' },
    critical: { label: 'Critical', class: 'badge-priority high' },
  };

  const { label, class: className } = config[priority as keyof typeof config] || config.medium;

  return <span className={className}>{label}</span>;
}

function LoadingState() {
  return (
    <div className="card">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading complaints...</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center">
          <svg
            className="h-8 w-8 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          {hasFilters ? 'No complaints match your filters' : 'No complaints yet'}
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          {hasFilters
            ? 'Try adjusting your filters to see more results.'
            : 'Submit your first complaint to get started with tracking city issues.'}
        </p>
        {!hasFilters && (
          <Link href="/citizen/complaints/new" className="btn-primary">
            Submit New Complaint
          </Link>
        )}
      </div>
    </div>
  );
}
