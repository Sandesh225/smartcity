// app/api/admin/staff-assignments/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser, getEffectiveRole } from "@/lib/auth/utils";
import { hasMinRole } from "@/lib/auth/roles";
import { createStaffAssignment } from "@/lib/admin/staff";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const role = await getEffectiveRole();

    if (!user || !role || !hasMinRole(role, "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const assignment = await createStaffAssignment({
      user_id: body.user_id,
      ward_id: body.ward_id ?? null,
      department_id: body.department_id ?? null,
      role_in_assignment: body.role_in_assignment,
      reports_to_user_id: null,
      can_approve_complaints: !!body.can_approve_complaints,
      can_assign_complaints: !!body.can_assign_complaints,
      assigned_by: user.id,
    });

    return NextResponse.json({ data: assignment });
  } catch (error: any) {
    console.error("Error creating staff assignment:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
