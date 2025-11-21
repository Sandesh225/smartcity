// app/(admin)/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  getDashboardKPIs,
  getTopWidgets,
  getSystemAlerts,
} from "@/lib/admin/dashboard";
import { DashboardFilters } from "@/components/admin/DashboardFilters";

interface PageProps {
  searchParams: {
    time_range?: string;
    ward_id?: string;
    department_id?: string;
    category_id?: string;
  };
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const supabase = await createClient();

  const filters = {
    timeRange: searchParams.time_range || "week",
    wardId: searchParams.ward_id,
    departmentId: searchParams.department_id,
    categoryId: searchParams.category_id,
  };

  const [kpis, widgets, alerts] = await Promise.all([
    getDashboardKPIs(filters),
    getTopWidgets(filters),
    getSystemAlerts(),
  ]);

  const [{ data: wards }, { data: departments }, { data: categories }] =
    await Promise.all([
      supabase
        .from("wards")
        .select("ward_id, ward_name, ward_number")
        .eq("is_active", true)
        .order("ward_number"),
      supabase
        .from("departments")
        .select("department_id, department_name")
        .eq("is_active", true)
        .order("department_name"),
      supabase
        .from("complaint_categories")
        .select("category_id, category_name")
        .eq("is_active", true)
        .order("category_name"),
    ]);

  const timeLabel =
    filters.timeRange === "today"
      ? "Today"
      : filters.timeRange === "week"
      ? "This Week"
      : filters.timeRange === "month"
      ? "This Month"
      : filters.timeRange === "quarter"
      ? "This Quarter"
      : filters.timeRange === "year"
      ? "This Year"
      : "All Time";

  return (
    <>
      <DashboardFilters
        wards={wards || []}
        departments={departments || []}
        categories={categories || []}
        currentFilters={filters}
      />

      {alerts.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h2 className="card-title text-base">System Alerts</h2>
            <span className="badge-status new">
              <span className="badge-dot" />
              {alerts.length} Active
            </span>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  alert.severity === "critical"
                    ? "bg-red-500/10 border-red-500/30 text-red-300"
                    : alert.severity === "warning"
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-sm">{alert.title}</div>
                    <div className="text-xs text-muted mt-1">
                      {alert.message}
                    </div>
                  </div>
                  {alert.actionUrl && (
                    <Link href={alert.actionUrl} className="chip text-xs">
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-hero mb-4">
        <div className="hero-left">
          <h1 className="hero-title">System Overview</h1>
          <p className="hero-subtitle">
            Monitoring {kpis.totalComplaints} complaints across{" "}
            {kpis.activeWards} wards
          </p>
          <div className="hero-badges">
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              <span>SLA Compliance: {kpis.slaComplianceRate}%</span>
            </div>
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              <span>{kpis.overdueCount} Overdue</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link href="/admin/complaints?status=new" className="btn-primary">
              View New Complaints
            </Link>
            <Link href="/admin/reports" className="btn-secondary">
              Generate Report
            </Link>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-metric-label">Average Resolution Time</div>
          <div className="hero-metric-main">{kpis.avgResolutionHours}h</div>
          <div className="hero-metric-sub">
            {kpis.resolvedToday} resolved today
          </div>
          <div className="hero-progress">
            <div
              className="hero-progress-bar"
              style={{ width: `${kpis.slaComplianceRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-grid mb-4">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Key Performance Indicators</h2>
            <div className="text-xs text-muted">{timeLabel}</div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total</div>
              <div className="stat-value">{kpis.totalComplaints}</div>
              <div className="stat-pill">Complaints</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">New</div>
              <div className="stat-value text-blue-400">
                {kpis.newComplaints}
              </div>
              <div className="stat-pill">Unassigned</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">In Progress</div>
              <div className="stat-value text-yellow-400">
                {kpis.inProgressComplaints}
              </div>
              <div className="stat-pill">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Resolved</div>
              <div className="stat-value text-green-400">
                {kpis.resolvedComplaints}
              </div>
              <div className="stat-pill">Completed</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">High Priority Complaints</h2>
            <Link
              href="/admin/complaints?priority=urgent,high"
              className="card-subtitle hover:text-green-400"
            >
              View All →
            </Link>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Ward</th>
                  <th>Status</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                {widgets.highPriorityComplaints.length > 0 ? (
                  widgets.highPriorityComplaints.map((complaint: any) => (
                    <tr key={complaint.complaint_id}>
                      <td className="font-mono text-xs">
                        {complaint.tracking_id}
                      </td>
                      <td className="max-w-[150px] truncate">
                        {complaint.title}
                      </td>
                      <td className="text-muted">
                        Ward {complaint.ward_number}
                      </td>
                      <td>
                        <span
                          className={`badge-status ${String(
                            complaint.status
                          ).replace("_", "-")}`}
                        >
                          <span className="badge-dot" />
                          {String(complaint.status).replace("_", " ")}
                        </span>
                      </td>
                      <td className="text-muted text-xs">{complaint.age}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-6">
                      No high-priority complaints
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top Categories</h2>
          </div>
          <div className="space-y-2">
            {widgets.topCategories.map((cat: any) => (
              <div
                key={cat.category_id}
                className="flex items-center justify-between p-2 rounded border border-border-subtle hover:bg-bg-elevated transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {cat.category_name}
                  </div>
                  <div className="text-xs text-muted">
                    {cat.count} complaints
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-400">
                    {cat.resolved_rate}%
                  </div>
                  <div className="text-xs text-muted">resolved</div>
                </div>
              </div>
            ))}
            {widgets.topCategories.length === 0 && (
              <div className="text-xs text-muted py-4 text-center">
                No category data
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top Wards</h2>
          </div>
          <div className="space-y-2">
            {widgets.topWards.map((ward: any) => (
              <div
                key={ward.ward_id}
                className="flex items-center justify-between p-2 rounded border border-border-subtle hover:bg-bg-elevated transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Ward {ward.ward_number}
                  </div>
                  <div className="text-xs text-muted">
                    {ward.count} complaints
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xs ${
                      ward.overdue_count > 0
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {ward.overdue_count} overdue
                  </div>
                </div>
              </div>
            ))}
            {widgets.topWards.length === 0 && (
              <div className="text-xs text-muted py-4 text-center">
                No ward data
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Overdue by Department</h2>
          </div>
          <div className="space-y-2">
            {widgets.overdueDepartments.map((dept: any) => (
              <div
                key={dept.department_id}
                className="flex items-center justify-between p-2 rounded border border-border-subtle hover:bg-bg-elevated transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {dept.department_name}
                  </div>
                  <div className="text-xs text-muted">
                    {dept.total_count} total
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-red-400 font-semibold">
                    {dept.overdue_count}
                  </div>
                  <div className="text-xs text-muted">overdue</div>
                </div>
              </div>
            ))}
            {widgets.overdueDepartments.length === 0 && (
              <div className="text-xs text-muted py-4 text-center">
                No overdue department data
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
