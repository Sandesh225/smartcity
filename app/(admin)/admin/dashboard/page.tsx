// ============================================================================
// FILE: app/(admin)/admin/dashboard/page.tsx
// Admin Dashboard — Fully Corrected Version
// ============================================================================

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Users,
  Megaphone,
} from "lucide-react";

import type {
  AdminComplaintSummary,
  ComplaintStatus,
} from "@/components/admin/complaints/types";

// ----------------------------------------------------------------------------
// SUPABASE SERVER CLIENT
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// CORRECT TYPES (MATCH YOUR SUPABASE SCHEMA)
// ----------------------------------------------------------------------------

type ComplaintForSummary = {
  id: string;
  status: ComplaintStatus;
  sla_due_date: string | null; // FIXED — matches database
};

type ComplaintWithAssignee = {
  id: string;
  status: ComplaintStatus;
  assigned_to_user_id: string | null; // FIXED — correct column
  assignee: {
    full_name: string | null;
    email: string | null;
  } | null;
};

type LatestComplaintRow = {
  id: string;
  tracking_id: string;
  title: string;
  status: ComplaintStatus;
  priority: string;
  created_at: string;
};

// ============================================================================
// PAGE
// ============================================================================
export default async function AdminDashboardPage() {
  const supabase = await getSupabaseServer();

  // --------------------------------------------------------------------------
  // 1. SUMMARY BLOCK (SLA, STATUS COUNTS)
  // --------------------------------------------------------------------------
  const { data: summaryRows, error: summaryError } = await supabase
    .from("complaints")
    .select("id, status, sla_due_date")
    .limit(2000);

  if (summaryError)
    console.error("AdminDashboard summary query error", summaryError);

  const summaryBase: AdminComplaintSummary = {
    total: summaryRows?.length ?? 0,
    new_count: 0,
    in_progress_count: 0,
    resolved_count: 0,
    closed_count: 0,
    overdue_count: 0,
  };

  const now = new Date();

  (summaryRows || []).forEach((c: ComplaintForSummary) => {
    switch (c.status) {
      case "new":
        summaryBase.new_count += 1;
        break;

      case "in_progress":
        summaryBase.in_progress_count += 1;
        break;

      case "resolved":
        summaryBase.resolved_count += 1;
        break;

      case "closed":
        summaryBase.closed_count += 1;
        break;
    }

    // SLA OVERDUE (only for active)
    const isActive = ["new", "in_progress"].includes(c.status);
    if (isActive && c.sla_due_date && new Date(c.sla_due_date) < now) {
      summaryBase.overdue_count += 1;
    }
  });

  const summary = summaryBase;

  // --------------------------------------------------------------------------
  // 2. WORKLOAD BLOCK (ASSIGNEE COUNTS)
  // --------------------------------------------------------------------------
  const { data: workloadRows, error: workloadError } = await supabase
    .from("complaints")
    .select(
      `
      id,
      status,
      assigned_to_user_id,
      assignee:user_profiles!complaints_assigned_to_user_id_fkey(
        full_name,
        email
      )
    `
    )
    .in("status", ["new", "in_progress"])
    .limit(1000);

  if (workloadError)
    console.error("AdminDashboard workload error", workloadError);

  const workloadMap = new Map<
    string,
    {
      assignee_id: string | null;
      name: string;
      email: string | null;
      count: number;
    }
  >();

  (workloadRows || []).forEach((c: ComplaintWithAssignee) => {
    const key = c.assigned_to_user_id || "unassigned";
    const name = c.assignee?.full_name || c.assignee?.email || "Unassigned";

    if (!workloadMap.has(key)) {
      workloadMap.set(key, {
        assignee_id: c.assigned_to_user_id,
        name,
        email: c.assignee?.email ?? null,
        count: 0,
      });
    }

    workloadMap.get(key)!.count++;
  });

  const topWorkload = Array.from(workloadMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --------------------------------------------------------------------------
  // 3. LATEST COMPLAINTS
  // --------------------------------------------------------------------------
  const { data: latestRowsRaw, error: latestError } = await supabase
    .from("complaints")
    .select("id, tracking_id, title, status, priority, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (latestError)
    console.error("AdminDashboard latest complaints error", latestError);

  const latestRows: LatestComplaintRow[] =
    (latestRowsRaw as LatestComplaintRow[]) || [];

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <section className="space-y-5">
      {/* HEADER */}
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title text-lg">Admin control center</h1>
            <p className="card-subtitle text-xs text-slate-400">
              Monitor complaints, track SLAs and coordinate staff across Pokhara
              Metropolitan City.
            </p>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="grid gap-3 border-t border-slate-800/80 bg-slate-950/40 px-4 py-3 md:grid-cols-4">
          {/* Total */}
          <DashboardKPI
            icon={<ClipboardList className="h-4 w-4 text-slate-100" />}
            iconBg="bg-slate-800"
            label="Total complaints"
            value={summary.total}
          />

          {/* Active */}
          <DashboardKPI
            icon={<AlertTriangle className="h-4 w-4 text-amber-300" />}
            iconBg="bg-amber-900/40"
            label="Active (new + in progress)"
            value={summary.new_count + summary.in_progress_count}
          />

          {/* Resolved */}
          <DashboardKPI
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
            iconBg="bg-emerald-900/40"
            label="Resolved"
            value={summary.resolved_count + summary.closed_count}
          />

          {/* Overdue */}
          <DashboardKPI
            icon={<Clock className="h-4 w-4 text-red-300" />}
            iconBg="bg-red-900/40"
            label="Overdue (SLA)"
            value={summary.overdue_count}
          />
        </div>
      </div>

      {/* MODULE NAVIGATION */}
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardNavCard
          href="/admin/complaints"
          icon={<ClipboardList className="h-4 w-4 text-emerald-200" />}
          iconBg="bg-emerald-900/50"
          title="Complaints"
          desc="City-wide complaint list with filters, status updates and duty allocation."
          border="border-emerald-700/40"
        />

        <DashboardNavCard
          href="/admin/notices"
          icon={<Megaphone className="h-4 w-4 text-slate-100" />}
          iconBg="bg-slate-800"
          title="Notices & announcements"
          desc="Publish city notices, emergencies and events."
        />

        <DashboardNavCard
          href="/super-admin/users"
          icon={<Users className="h-4 w-4 text-slate-100" />}
          iconBg="bg-slate-800"
          title="Staff & roles"
          desc="Manage ward staff and admin accounts (super admin only)."
        />
      </div>

      {/* LOWER GRID */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* WORKLOAD */}
        <div className="card bg-slate-900/70 border border-slate-800">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-200" />
              <h2 className="card-title text-sm">Team workload</h2>
            </div>
            <p className="card-subtitle text-[11px] text-slate-400">
              Open complaints per assignee (top 5).
            </p>
          </div>

          <div className="px-4 pb-4 text-xs">
            {topWorkload.length === 0 ? (
              <div className="py-3 text-slate-500">
                No active complaints assigned yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {topWorkload.map((w) => (
                  <li
                    key={w.assignee_id ?? "unassigned"}
                    className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-100">
                        {w.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {w.email || "No email"} •{" "}
                        {w.assignee_id ? "Staff" : "Unassigned bucket"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-300">
                        {w.count}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        active complaints
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* LATEST COMPLAINTS */}
        <div className="card bg-slate-900/70 border border-slate-800">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-slate-200" />
              <h2 className="card-title text-sm">Latest complaints</h2>
            </div>
            <p className="card-subtitle text-[11px] text-slate-400">
              Recently created complaints across the city.
            </p>
          </div>

          <div className="px-4 pb-4 text-xs">
            {latestRows.length === 0 ? (
              <div className="py-3 text-slate-500">
                No complaints have been submitted yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-800/80">
                {latestRows.map((c) => (
                  <li
                    key={c.id}
                    className="py-2 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-100 line-clamp-1">
                        {c.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Ref: {c.tracking_id || c.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <div className="mb-0.5">
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                      <span className="rounded-full bg-slate-800/70 px-2 py-0.5 text-[10px]">
                        {c.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 text-right">
              <Link
                href="/admin/complaints"
                className="text-[11px] text-emerald-400 hover:text-emerald-300"
              >
                Go to complaints list →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SMALL UI COMPONENTS FOR CLEANER STRUCTURE
// ============================================================================
function DashboardKPI({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 px-3 py-3">
      <div className={`rounded-full ${iconBg} p-2`}>{icon}</div>
      <div>
        <div className="text-[11px] text-slate-400">{label}</div>
        <div className="text-base font-semibold text-slate-50">{value}</div>
      </div>
    </div>
  );
}

function DashboardNavCard({
  href,
  icon,
  iconBg,
  title,
  desc,
  border = "border-slate-800",
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
  border?: string;
}) {
  return (
    <Link
      href={href}
      className={`card border ${border} bg-slate-900/70 hover:border-emerald-500/60 hover:bg-slate-900 transition-colors`}
    >
      <div className="card-header">
        <div className="flex items-center gap-2">
          <div className={`rounded-full ${iconBg} p-2`}>{icon}</div>
          <h2 className="card-title text-sm">{title}</h2>
        </div>
      </div>
      <div className="px-4 pb-4 text-xs text-slate-300">{desc}</div>
    </Link>
  );
}
