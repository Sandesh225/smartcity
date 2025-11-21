// lib/admin/staff.ts
import { createClient } from "@/lib/supabase/server";

interface CreateStaffAssignmentParams {
  user_id: string;
  ward_id?: string | null;
  department_id?: string | null;
  role_in_assignment: string;
  reports_to_user_id?: string | null;
  can_approve_complaints: boolean;
  can_assign_complaints: boolean;
  assigned_by: string;
}

export async function createStaffAssignment(params: CreateStaffAssignmentParams) {
  const supabase = await createClient();

  if (!params.ward_id && !params.department_id) {
    throw new Error("Must specify either ward_id or department_id");
  }

  const { data, error } = await supabase
    .from("staff_assignments")
    .insert({
      user_id: params.user_id,
      ward_id: params.ward_id ?? null,
      department_id: params.department_id ?? null,
      role_in_assignment: params.role_in_assignment,
      reports_to_user_id: params.reports_to_user_id ?? null,
      can_approve_complaints: params.can_approve_complaints,
      can_assign_complaints: params.can_assign_complaints,
      assigned_by: params.assigned_by,
      is_primary_assignment: true,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStaffUsers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      `
      id,
      full_name,
      phone_number,
      status,
      user_roles:user_roles(
        role_id,
        roles:roles(role_name, role_description)
      ),
      staff_assignments:staff_assignments(
        assignment_id,
        ward:wards(ward_id, ward_name, ward_number),
        department:departments(department_id, department_name),
        role_in_assignment,
        is_active
      )
    `
    )
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getWardsAndDepartments() {
  const supabase = await createClient();

  const [{ data: wards }, { data: departments }] = await Promise.all([
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
  ]);

  return {
    wards: wards || [],
    departments: departments || [],
  };
}
