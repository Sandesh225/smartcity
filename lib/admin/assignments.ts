import { createClient } from "@/lib/supabase/server";

interface CreateStaffAssignmentParams {
  user_id: string;
  ward_id?: string;
  department_id?: string;
  role_in_assignment: string;
  reports_to_user_id?: string;
  can_approve_complaints: boolean;
  can_assign_complaints: boolean;
  assigned_by: string;
}

export async function createStaffAssignment(params: CreateStaffAssignmentParams) {
  const supabase = await createClient();

  // Validate: must have ward_id OR department_id
  if (!params.ward_id && !params.department_id) {
    throw new Error("Must specify either ward_id or department_id");
  }

  const { data, error } = await supabase
    .from("staff_assignments")
    .insert({
      user_id: params.user_id,
      ward_id: params.ward_id || null,
      department_id: params.department_id || null,
      role_in_assignment: params.role_in_assignment,
      reports_to_user_id: params.reports_to_user_id || null,
      can_approve_complaints: params.can_approve_complaints,
      can_assign_complaints: params.can_assign_complaints,
      assigned_by: params.assigned_by,
      is_primary_assignment: true, // First assignment is primary by default
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateStaffAssignment(
  assignmentId: string,
  updates: Partial<{
    ward_id: string;
    department_id: string;
    role_in_assignment: string;
    reports_to_user_id: string;
    can_approve_complaints: boolean;
    can_assign_complaints: boolean;
    is_active: boolean;
  }>
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("staff_assignments")
    .update(updates)
    .eq("assignment_id", assignmentId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getStaffAssignments(userId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("staff_assignments")
    .select(
      `
      *,
      user:user_profiles!staff_assignments_user_id_fkey(id, full_name),
      ward:wards(ward_id, ward_name, ward_number),
      department:departments(department_id, department_name),
      supervisor:user_profiles!staff_assignments_reports_to_user_id_fkey(full_name)
    `
    )
    .eq("is_active", true);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}