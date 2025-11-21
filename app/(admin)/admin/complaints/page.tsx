// app/(admin)/admin/complaints/page.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import {
  AlertTriangle,
  Filter,
  Search,
  UserRound,
  Clock,
  ClipboardList,
} from 'lucide-react';

import { AdminComplaintStatusBadge } from '@/components/admin/complaints/AdminComplaintStatusBadge';
import {
  type ComplaintStatus,
  type ComplaintPriority,
  type AdminComplaintRow,
  type StaffOption,
} from '@/components/admin/complaints/types';
import {
  updateComplaintStatusAction,
  assignComplaintAction,
} from './action';

type SearchParams = {
  status?: ComplaintStatus | 'all';
  priority?: ComplaintPriority | 'all';
  q?: string;
  ward?: string;
  assignee?: string;
};

// ADD THE MISSING CONSTANTS
const PRIORITY_LABEL: Record<ComplaintPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const PRIORITY_CLASS: Record<ComplaintPriority, string> = {
  low: 'bg-slate-900/60 text-slate-200 border-slate-700/70',
  medium: 'bg-amber-900/40 text-amber-100 border-amber-700/70',
  high: 'bg-orange-900/50 text-orange-100 border-orange-700/70',
  critical: 'bg-red-900/60 text-red-100 border-red-700/80',
};

async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignore
          }
        },
      },
    }
  );
}

// Fix: Match actual database column names
type ComplaintRowFromSupabase = {
  id: string;
  tracking_id: string; // CHANGED: was reference_code
  title: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  created_at: string;
  sla_due_date: string | null; // CHANGED: was sla_due_at
  ward: {
    ward_number: number | null;
    ward_name: string | null;
  } | null;
  department: {
    department_name: string | null;
  } | null;
  assignee: {
    full_name: string | null;
    email: string | null;
  } | null;
};

type StaffRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

export default async function AdminComplaintsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await getSupabaseServer();

  const statusFilter = (searchParams?.status || 'all') as ComplaintStatus | 'all';
  const priorityFilter = (searchParams?.priority || 'all') as ComplaintPriority | 'all';
  const wardFilter = (searchParams?.ward || '').trim();
  const assigneeFilter = (searchParams?.assignee || '').trim();
  const q = (searchParams?.q || '').trim();

  // ------------------------------------------------------------------
  // FIXED QUERY: Using correct column names from your schema
  // ------------------------------------------------------------------
  let query = supabase
    .from('complaints')
    .select(
      `
      id,
      tracking_id,
      title,
      status,
      priority,
      created_at,
      sla_due_date,
      ward:wards(ward_number, ward_name),
      assigned_department_id,
      assigned_to_user_id,
      assigned_department:departments!complaints_assigned_department_id_fkey(department_name),
      assignee:user_profiles!complaints_assigned_to_user_id_fkey(full_name, email)
    `
    )
    .order('created_at', { ascending: false });

  // Apply filters
  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (priorityFilter !== 'all') {
    query = query.eq('priority', priorityFilter);
  }

  if (wardFilter) {
    query = query.eq('ward_id', wardFilter);
  }

  if (assigneeFilter === 'unassigned') {
    query = query.is('assigned_to_user_id', null);
  } else if (assigneeFilter) {
    query = query.eq('assigned_to_user_id', assigneeFilter);
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,tracking_id.ilike.%${q}%`);
  }

  const { data: complaintRows, error } = await query;

  if (error) {
    console.error('AdminComplaintsPage query error:', error);
    return (
      <div className="p-6 text-red-400">
        Error loading complaints: {error.message}
      </div>
    );
  }

  console.log('Complaints found:', complaintRows?.length); // Debug log

  const typedComplaintRows = (complaintRows || []) as ComplaintRowFromSupabase[];

  // Transform to match your component's expected format
  const rows: AdminComplaintRow[] = typedComplaintRows.map((c) => ({
    id: c.id,
    reference_code: c.tracking_id, // Map tracking_id to reference_code
    title: c.title,
    status: c.status,
    priority: c.priority,
    ward_number: c.ward?.ward_number ?? null,
    ward_name: c.ward?.ward_name ?? null,
    department_name: c.department?.department_name ?? null,
    assignee_name: c.assignee?.full_name ?? c.assignee?.email ?? null,
    created_at: c.created_at,
    sla_due_at: c.sla_due_date, // Map sla_due_date to sla_due_at
  }));

  // ------------------------------------------------------------------
  // Staff options for assignment
  // ------------------------------------------------------------------
  const { data: staffData } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, role')
    .in('role', ['staff', 'admin', 'officer']) // Include officers
    .order('full_name', { ascending: true });

  const typedStaffRows = (staffData || []) as StaffRow[];

  const staffOptions: StaffOption[] = typedStaffRows.map((s) => ({
    id: s.id,
    full_name: s.full_name || s.email || 'Unnamed',
    email: s.email || '',
  }));

  const assigneeFilterOptions = [
    { id: '', label: 'All' },
    { id: 'unassigned', label: 'Unassigned' },
    ...staffOptions.map((s) => ({ id: s.id, label: s.full_name })),
  ];

  const totalCount = rows.length;
  const now = new Date();
  const overdueCount = rows.filter(
    (r) =>
      r.sla_due_at &&
      new Date(r.sla_due_at) < now &&
      ['new', 'in_progress'].includes(r.status) // FIXED: Your schema uses 'in_progress' not 'in_review'
  ).length;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="card-title text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-emerald-300" />
            Complaints ({totalCount})
          </h1>
          <p className="card-subtitle text-xs text-slate-400">
            View, triage, update status, and allocate duties to ward staff.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-700/80">
            <span className="text-slate-400">Total</span>
            <span className="font-semibold text-slate-50">{totalCount}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-red-950/60 px-3 py-1 border border-red-800/80">
            <Clock className="h-3.5 w-3.5 text-red-300" />
            <span className="text-red-100 text-[11px]">Overdue</span>
            <span className="font-semibold text-red-100">{overdueCount}</span>
          </div>
        </div>
      </div>

      {/* Filters card – pure HTML form (GET), no event handlers */}
      <form
        className="card flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 p-4 text-xs"
        action="/admin/complaints"
        method="GET"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-slate-400">Status</span>
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-xs text-slate-100"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option> {/* CHANGED: from in_review */}
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Priority</span>
          <select
            name="priority"
            defaultValue={priorityFilter}
            className="rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-xs text-slate-100"
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Assignee</span>
          <select
            name="assignee"
            defaultValue={assigneeFilter}
            className="rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-xs text-slate-100"
          >
            {assigneeFilterOptions.map((opt) => (
              <option key={opt.id || 'all'} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* If wardFilter comes from dashboard links, preserve it even if there is no dropdown */}
        {wardFilter && <input type="hidden" name="ward" value={wardFilter} />}

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1.5 h-3.5 w-3.5 text-slate-500" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search title or reference..."
              className="w-60 rounded-md border border-slate-700 bg-slate-950/70 pl-7 pr-2 py-1 text-xs text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-emerald-500"
          >
            Apply
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="card bg-slate-900/60 border border-slate-800 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">
            No complaints found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400">
                  <th className="px-3 py-2 text-left font-medium">Reference</th>
                  <th className="px-3 py-2 text-left font-medium">Title</th>
                  <th className="px-3 py-2 text-left font-medium">Ward</th>
                  <th className="px-3 py-2 text-left font-medium">Department</th>
                  <th className="px-3 py-2 text-left font-medium">Priority</th>
                  <th className="px-3 py-2 text-left font-medium">Assignee</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Created</th>
                  <th className="px-3 py-2 text-left font-medium">SLA Due</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const isOverdue =
                    c.sla_due_at &&
                    new Date(c.sla_due_at) < now &&
                    ['new', 'in_progress'].includes(c.status); // FIXED: in_progress not in_review

                  return (
                    <tr
                      key={c.id}
                      className="border-t border-slate-800/80 hover:bg-slate-900/80"
                    >
                      <td className="px-3 py-2 align-top text-slate-300">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-[11px]">
                            {c.reference_code || c.id.slice(0, 8)}
                          </span>
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-900/60 px-1.5 py-0.5 text-[10px] font-semibold text-red-100">
                              <AlertTriangle className="h-3 w-3" />
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="max-w-xs">
                          <div className="font-medium text-slate-100 line-clamp-2">
                            {c.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-300">
                        {c.ward_number ? (
                          <>
                            Ward {c.ward_number}
                            {c.ward_name ? ` – ${c.ward_name}` : ''}
                          </>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-slate-300">
                        {c.department_name || <span className="text-slate-500">—</span>}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${PRIORITY_CLASS[c.priority]}`}
                        >
                          {PRIORITY_LABEL[c.priority]}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <form
                          action={assignComplaintAction}
                          className="flex items-center gap-1"
                        >
                          <input type="hidden" name="complaint_id" value={c.id} />
                          <div className="relative flex-1">
                            <UserRound className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 text-slate-500" />
                            <select
                              name="assignee_id"
                              defaultValue={
                                staffOptions.find((s) => s.full_name === c.assignee_name)
                                  ?.id || ''
                              }
                              className="w-36 rounded-md border border-slate-700 bg-slate-950/70 pl-5 pr-1 py-1 text-[11px] text-slate-100"
                            >
                              <option value="">Unassigned</option>
                              {staffOptions.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.full_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </form>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <AdminComplaintStatusBadge status={c.status} />
                      </td>
                      <td className="px-3 py-2 align-top text-slate-300">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 align-top text-slate-300">
                        {c.sla_due_at
                          ? new Date(c.sla_due_at).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        {/* Status transitions - UPDATED for in_progress */}
                        <div className="flex flex-wrap justify-end gap-1">
                          {c.status === 'new' && (
                            <form action={updateComplaintStatusAction}>
                              <input type="hidden" name="complaint_id" value={c.id} />
                              <input type="hidden" name="next_status" value="in_progress" /> {/* CHANGED */}
                              <button
                                type="submit"
                                className="rounded-md border border-amber-700 bg-amber-900/40 px-2 py-0.5 text-[10px] font-medium text-amber-200 hover:bg-amber-900/60"
                              >
                                Start work
                              </button>
                            </form>
                          )}

                          {c.status === 'in_progress' && (
                            <form action={updateComplaintStatusAction}>
                              <input type="hidden" name="complaint_id" value={c.id} />
                              <input type="hidden" name="next_status" value="resolved" />
                              <button
                                type="submit"
                                className="rounded-md border border-emerald-700 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-medium text-emerald-200 hover:bg-emerald-900/70"
                              >
                                Mark resolved
                              </button>
                            </form>
                          )}

                          {c.status === 'resolved' && (
                            <form action={updateComplaintStatusAction}>
                              <input type="hidden" name="complaint_id" value={c.id} />
                              <input type="hidden" name="next_status" value="closed" />
                              <button
                                type="submit"
                                className="rounded-md border border-slate-700 bg-slate-900/70 px-2 py-0.5 text-[10px] font-medium text-slate-200 hover:bg-slate-800"
                              >
                                Close
                              </button>
                            </form>
                          )}

                          {['new', 'in_progress'].includes(c.status) && (
                            <form action={updateComplaintStatusAction}>
                              <input type="hidden" name="complaint_id" value={c.id} />
                              <input type="hidden" name="next_status" value="rejected" />
                              <button
                                type="submit"
                                className="rounded-md border border-rose-700 bg-rose-900/40 px-2 py-0.5 text-[10px] font-medium text-rose-200 hover:bg-rose-900/60"
                              >
                                Reject
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}