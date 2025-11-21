// app/(admin)/admin/notices/new/page.tsx
import { redirect } from "next/navigation";
import { AdminNoticeForm } from "@/components/admin/notices/AdminNoticeForm";
import type {
  WardOption,
  DepartmentOption,
} from "@/components/admin/notices/types";
import { createNoticeAction } from "../actions";
import { requireSessionAndProfile } from "@/lib/auth/server-profile";

export const dynamic = "force-dynamic";

export default async function AdminCreateNoticePage() {
  const { supabase, profile } = await requireSessionAndProfile(
    "/admin/notices/new"
  );

  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/"); // or redirect(getDefaultPortalPath(profile.role))
  }

  const [wardsRes, departmentsRes] = await Promise.all([
    supabase
      .from("wards")
      .select("id, ward_number, ward_name")
      .order("ward_number"),
    supabase
      .from("departments")
      .select("id, department_name")
      .order("department_name"),
  ]);

  if (wardsRes.error) {
    console.error("AdminCreateNoticePage wards error", wardsRes.error);
  }
  if (departmentsRes.error) {
    console.error(
      "AdminCreateNoticePage departments error",
      departmentsRes.error
    );
  }

  const wards = (wardsRes.data || []) as WardOption[];
  const departments = (departmentsRes.data || []) as DepartmentOption[];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Create New Notice
        </h1>
        <p className="text-sm text-slate-400">
          Publish important updates and announcements to citizens.
        </p>
      </div>

      <AdminNoticeForm
        mode="create"
        wards={wards}
        departments={departments}
        onSubmit={createNoticeAction}
      />
    </div>
  );
}
