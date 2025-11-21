// app/(admin)/admin/notices/[id]/edit/page.tsx
import { redirect } from "next/navigation";
import { AdminNoticeForm } from "@/components/admin/notices/AdminNoticeForm";
import type {
  WardOption,
  DepartmentOption,
  NoticeRow,
} from "@/components/admin/notices/types";
import { updateNoticeAction } from "../../actions";
import { requireSessionAndProfile } from "@/lib/auth/server-profile";

export const dynamic = "force-dynamic";

type PageParams = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditNoticePage({ params }: PageParams) {
  const { id } = await params;

  const { supabase, profile } = await requireSessionAndProfile(
    `/admin/notices/${id}/edit`
  );

  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/");
  }

  try {
    // 1) Load notice
    const { data: notice, error: noticeError } = await supabase
      .from("notices")
      .select("*")
      .eq("id", id)
      .single();

    if (noticeError) {
      console.error("AdminEditNoticePage notice error:", noticeError);
      throw new Error(`Failed to load notice: ${noticeError.message}`);
    }

    if (!notice) {
      throw new Error("Notice not found");
    }

    // 2) Load wards + departments
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
      console.error("AdminEditNoticePage wards error:", wardsRes.error);
    }
    if (departmentsRes.error) {
      console.error("AdminEditNoticePage departments error:", departmentsRes.error);
    }

    const wards = (wardsRes.data || []) as WardOption[];
    const departments = (departmentsRes.data || []) as DepartmentOption[];

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Edit Notice</h1>
          <p className="text-slate-400">
            Update notice details and republish changes.
          </p>
        </div>

        <AdminNoticeForm
          mode="edit"
          initialValues={notice as NoticeRow}
          wards={wards}
          departments={departments}
          onSubmit={updateNoticeAction}
        />
      </div>
    );
  } catch (error) {
    console.error("AdminEditNoticePage error:", error);
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Edit Notice</h1>
        <div className="rounded-lg border border-red-800 bg-red-950/50 p-4">
          <p className="text-red-200">Error loading notice</p>
          <p className="text-sm text-red-300 mt-2">
            {error instanceof Error ? error.message : "Notice not found or access denied."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-3 rounded bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
}