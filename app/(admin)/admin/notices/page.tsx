// app/(admin)/admin/notices/page.tsx
import { AdminNoticesClient } from "@/components/admin/notices/AdminNoticesClient";
import type {
  NoticeRow,
  WardOption,
  DepartmentOption,
} from "@/components/admin/notices/types";
import { requireSessionAndProfile } from "@/lib/auth/server-profile";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  const { supabase, profile } = await requireSessionAndProfile("/admin/notices");

  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/");
  }

  try {
    const [{ data: notices, error: noticesError }, wardsRes, departmentsRes] =
      await Promise.all([
        supabase
          .from("notices")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("wards")
          .select("id, ward_number, ward_name")
          .order("ward_number"),
        supabase
          .from("departments")
          .select("id, department_name")
          .order("department_name"),
      ]);

    if (noticesError) {
      console.error("AdminNoticesPage notices error:", noticesError);
      throw new Error(`Failed to load notices: ${noticesError.message}`);
    }

    if (wardsRes.error) {
      console.error("AdminNoticesPage wards error:", wardsRes.error);
    }

    if (departmentsRes.error) {
      console.error("AdminNoticesPage departments error:", departmentsRes.error);
    }

    const rows = (notices || []) as NoticeRow[];
    const wards = (wardsRes.data || []) as WardOption[];
    const departments = (departmentsRes.data || []) as DepartmentOption[];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notices Management</h1>
            <p className="text-slate-400">Create and manage city notices</p>
          </div>
        </div>
        
        <AdminNoticesClient
          initialRows={rows}
          wards={wards}
          departments={departments}
        />
      </div>
    );
  } catch (error) {
    console.error("AdminNoticesPage error:", error);
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Notices Management</h1>
        <div className="rounded-lg border border-red-800 bg-red-950/50 p-4">
          <p className="text-red-200">Error loading notices</p>
          <p className="text-sm text-red-300 mt-2">
            {error instanceof Error ? error.message : "Please check your RLS policies and try again."}
          </p>
        </div>
      </div>
    );
  }
}