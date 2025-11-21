// lib/admin/dashboard.ts
import { createClient } from "@/lib/supabase/server";

interface DashboardFilters {
  timeRange: string;
  wardId?: string;
  departmentId?: string;
  categoryId?: string;
}

export async function getDashboardKPIs(filters: DashboardFilters) {
  const supabase = await createClient();
  const dateFilter = getDateFilter(filters.timeRange);

  let query = supabase
    .from("complaints")
    .select(
      "complaint_id, status, created_at, resolved_at, sla_due_date, is_overdue",
      { count: "exact" }
    )
    .is("deleted_at", null);

  if (dateFilter) query = query.gte("created_at", dateFilter);
  if (filters.wardId) query = query.eq("ward_id", filters.wardId);
  if (filters.departmentId)
    query = query.eq("assigned_department_id", filters.departmentId);
  if (filters.categoryId)
    query = query.eq("complaint_category_id", filters.categoryId);

  const { data: complaints, count: totalComplaints } = await query;

  if (!complaints) {
    return getEmptyKPIs();
  }

  const newComplaints = complaints.filter((c) => c.status === "new").length;
  const inProgressComplaints = complaints.filter(
    (c) => c.status === "in_progress" || c.status === "assigned"
  ).length;
  const resolvedComplaints = complaints.filter(
    (c) => c.status === "resolved" || c.status === "closed"
  ).length;
  const overdueCount = complaints.filter((c) => c.is_overdue).length;

  const resolvedWithTime = complaints.filter(
    (c) => c.resolved_at && c.created_at
  );
  const totalResolutionHours = resolvedWithTime.reduce((sum, c) => {
    const hours =
      (new Date(c.resolved_at as string).getTime() -
        new Date(c.created_at as string).getTime()) /
      (1000 * 60 * 60);
    return sum + hours;
  }, 0);
  const avgResolutionHours =
    resolvedWithTime.length > 0
      ? Math.round(totalResolutionHours / resolvedWithTime.length)
      : 0;

  const resolvedOnTime = complaints.filter(
    (c) =>
      (c.status === "resolved" || c.status === "closed") &&
      c.resolved_at &&
      c.sla_due_date &&
      new Date(c.resolved_at as string) <= new Date(c.sla_due_date as string)
  ).length;
  const slaComplianceRate =
    resolvedComplaints > 0
      ? Math.round((resolvedOnTime / resolvedComplaints) * 100)
      : 0;

  const today = new Date().toISOString().split("T")[0];
  const resolvedToday = complaints.filter(
    (c) => c.resolved_at && (c.resolved_at as string).startsWith(today)
  ).length;

  const { count: activeWards } = await supabase
    .from("wards")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return {
    totalComplaints: totalComplaints || 0,
    newComplaints,
    inProgressComplaints,
    resolvedComplaints,
    overdueCount,
    avgResolutionHours,
    slaComplianceRate,
    resolvedToday,
    activeWards: activeWards || 0,
  };
}

export async function getTopWidgets(filters: DashboardFilters) {
  const supabase = await createClient();
  const dateFilter = getDateFilter(filters.timeRange);

  // High priority complaints
  let highPriorityQuery = supabase
    .from("complaints")
    .select(
      `
      complaint_id,
      tracking_id,
      title,
      status,
      priority_level,
      created_at,
      ward_id,
      wards!inner(ward_number)
    `
    )
    .in("priority_level", ["high", "urgent"])
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  if (dateFilter)
    highPriorityQuery = highPriorityQuery.gte("created_at", dateFilter);
  if (filters.wardId)
    highPriorityQuery = highPriorityQuery.eq("ward_id", filters.wardId);

  const { data: highPriorityComplaints } = await highPriorityQuery;

  // Top categories
  let categoryQuery = supabase
    .from("complaints")
    .select(
      `
      complaint_category_id,
      status,
      complaint_categories!inner(category_id, category_name)
    `
    )
    .is("deleted_at", null);

  if (dateFilter) categoryQuery = categoryQuery.gte("created_at", dateFilter);
  if (filters.wardId) categoryQuery = categoryQuery.eq("ward_id", filters.wardId);

  const { data: categoryData } = await categoryQuery;

  const categoryStats = categoryData?.reduce((acc: any, curr: any) => {
    const catId = curr.complaint_category_id;
    const catName = curr.complaint_categories?.category_name || "Unknown";

    if (!acc[catId]) {
      acc[catId] = {
        category_id: catId,
        category_name: catName,
        count: 0,
        resolved: 0,
      };
    }

    acc[catId].count++;
    if (curr.status === "resolved" || curr.status === "closed") {
      acc[catId].resolved++;
    }

    return acc;
  }, {} as Record<string, any>);

  const topCategories = Object.values(categoryStats || {})
    .map((cat: any) => ({
      ...cat,
      resolved_rate:
        cat.count > 0 ? Math.round((cat.resolved / cat.count) * 100) : 0,
    }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  // Top wards
  let wardQuery = supabase
    .from("complaints")
    .select(
      `
      ward_id,
      is_overdue,
      wards!inner(ward_id, ward_number)
    `
    )
    .is("deleted_at", null);

  if (dateFilter) wardQuery = wardQuery.gte("created_at", dateFilter);

  const { data: wardData } = await wardQuery;

  const wardStats = wardData?.reduce((acc: any, curr: any) => {
    const wardId = curr.ward_id;
    const wardNumber = curr.wards?.ward_number;

    if (!acc[wardId]) {
      acc[wardId] = {
        ward_id: wardId,
        ward_number: wardNumber,
        count: 0,
        overdue_count: 0,
      };
    }

    acc[wardId].count++;
    if (curr.is_overdue) {
      acc[wardId].overdue_count++;
    }

    return acc;
  }, {} as Record<string, any>);

  const topWards = Object.values(wardStats || {})
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  // Overdue departments
  let deptQuery = supabase
    .from("complaints")
    .select(
      `
      assigned_department_id,
      is_overdue,
      departments!inner(department_id, department_name)
    `
    )
    .is("deleted_at", null)
    .not("assigned_department_id", "is", null);

  if (dateFilter) deptQuery = deptQuery.gte("created_at", dateFilter);

  const { data: deptData } = await deptQuery;

  const deptStats = deptData?.reduce((acc: any, curr: any) => {
    const deptId = curr.assigned_department_id;
    const deptName = curr.departments?.department_name || "Unknown";

    if (!acc[deptId]) {
      acc[deptId] = {
        department_id: deptId,
        department_name: deptName,
        total_count: 0,
        overdue_count: 0,
      };
    }

    acc[deptId].total_count++;
    if (curr.is_overdue) {
      acc[deptId].overdue_count++;
    }

    return acc;
  }, {} as Record<string, any>);

  const overdueDepartments = Object.values(deptStats || {})
    .filter((d: any) => d.overdue_count > 0)
    .sort((a: any, b: any) => b.overdue_count - a.overdue_count)
    .slice(0, 5);

  return {
    highPriorityComplaints: (highPriorityComplaints || []).map((c: any) => ({
      ...c,
      ward_number: c.wards?.ward_number,
      age: getComplaintAge(c.created_at),
    })),
    topCategories,
    topWards,
    overdueDepartments,
  };
}

export async function getSystemAlerts() {
  const supabase = await createClient();
  const alerts: any[] = [];

  const { count: overdueCount } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true })
    .eq("is_overdue", true)
    .is("deleted_at", null);

  if (overdueCount && overdueCount > 10) {
    alerts.push({
      severity: "critical",
      title: "High Overdue Complaint Count",
      message: `${overdueCount} complaints are overdue and require immediate attention`,
      actionUrl: "/admin/complaints?overdue=true",
    });
  }

  const { data: config } = await supabase
    .from("system_config")
    .select("config_key, config_value")
    .in("config_key", [
      "enable_sms_notifications",
      "enable_email_notifications",
    ]);

  const smsDisabled =
    config?.find((c) => c.config_key === "enable_sms_notifications")
      ?.config_value === false;
  const emailDisabled =
    config?.find((c) => c.config_key === "enable_email_notifications")
      ?.config_value === false;

  if (smsDisabled) {
    alerts.push({
      severity: "warning",
      title: "SMS Notifications Disabled",
      message: "Citizens and staff won't receive SMS updates",
      actionUrl: "/admin/settings",
    });
  }

  if (emailDisabled) {
    alerts.push({
      severity: "warning",
      title: "Email Notifications Disabled",
      message: "Email delivery is currently turned off",
      actionUrl: "/admin/settings",
    });
  }

  const staleCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: failedPayments } = await supabase
    .from("payment_transactions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .lt("initiated_at", staleCutoff);

  if (failedPayments && failedPayments > 5) {
    alerts.push({
      severity: "warning",
      title: "Stale Payment Transactions",
      message: `${failedPayments} payments have been pending for over 24 hours`,
      actionUrl: "/admin/payments",
    });
  }

  return alerts;
}

// Helpers
function getDateFilter(timeRange: string): string | null {
  const now = new Date();

  switch (timeRange) {
    case "today":
      return new Date(now.setHours(0, 0, 0, 0)).toISOString();
    case "week":
      return new Date(now.setDate(now.getDate() - 7)).toISOString();
    case "month":
      return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    case "quarter":
      return new Date(now.setMonth(now.getMonth() - 3)).toISOString();
    case "year":
      return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    default:
      return null;
  }
}

function getEmptyKPIs() {
  return {
    totalComplaints: 0,
    newComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    overdueCount: 0,
    avgResolutionHours: 0,
    slaComplianceRate: 0,
    resolvedToday: 0,
    activeWards: 0,
  };
}

function getComplaintAge(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  return "< 1h";
}
