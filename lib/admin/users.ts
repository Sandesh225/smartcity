// lib/admin/users.ts
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/server";

interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  ward_id?: string;
}

export async function getAllUsers(params: GetAllUsersParams) {
  const supabase = await createClient();
  const { page = 1, limit = 50, search, role, status, ward_id } = params;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("user_profiles")
    .select(
      `
      id,
      full_name,
      phone_number,
      status,
      ward_id,
      created_at,
      user_roles:user_roles(
        role_id,
        roles:roles(role_name, role_description)
      ),
      wards:wards(ward_name, ward_number)
    `,
      { count: "exact" }
    )
    .is("deleted_at", null)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone_number.ilike.%${search}%`
    );
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (ward_id) {
    query = query.eq("ward_id", ward_id);
  }

  const { data: users, error, count } = await query;
  if (error) throw error;

  let filteredUsers = users || [];
  if (role) {
    filteredUsers = filteredUsers.filter((user: any) =>
      user.user_roles?.some((ur: any) => ur.roles.role_name === role)
    );
  }

  return {
    users: filteredUsers,
    total: count || 0,
    page,
    limit,
  };
}

export async function getUserDetail(userId: string) {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError) throw userError;

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select(
      `
      *,
      roles:roles(role_name, role_description),
      assigned_by_profile:user_profiles!user_roles_assigned_by_fkey(full_name)
    `
    )
    .eq("user_id", userId)
    .eq("is_active", true);

  if (rolesError) throw rolesError;

  const { data: assignments, error: assignmentsError } = await supabase
    .from("staff_assignments")
    .select(
      `
      *,
      wards(ward_name, ward_number),
      departments(department_name),
      supervisor:user_profiles!staff_assignments_reports_to_user_id_fkey(full_name)
    `
    )
    .eq("user_id", userId)
    .eq("is_active", true);

  if (assignmentsError) throw assignmentsError;

  return { user, roles, assignments };
}

export async function createStaffUser(params: {
  email: string;
  fullName: string;
  phoneNumber?: string;
  roleName: string;
}) {
  const supabaseAdmin = await createAdminClient(); // in real app, use service key

  const tempPassword = generatePassword();

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: params.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: params.fullName,
      },
    });

  if (authError || !authData?.user) throw authError;

  const userId = authData.user.id;

  if (params.phoneNumber) {
    await supabaseAdmin
      .from("user_profiles")
      .update({ phone_number: params.phoneNumber })
      .eq("id", userId);
  }

  const { data: roleData, error: roleError } = await supabaseAdmin
    .from("roles")
    .select("role_id")
    .eq("role_name", params.roleName)
    .single();

  if (roleError || !roleData)
    throw new Error(`Role ${params.roleName} not found`);

  const { error: userRoleError } = await supabaseAdmin
    .from("user_roles")
    .insert({
      user_id: userId,
      role_id: roleData.role_id,
      is_active: true,
    });

  if (userRoleError) throw userRoleError;

  return { userId, tempPassword };
}

export async function assignRole(
  userId: string,
  roleName: string,
  adminUserId: string,
  expiresAt?: string
) {
  const supabase = await createClient();

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("role_id")
    .eq("role_name", roleName)
    .single();

  if (roleError || !role) {
    throw new Error(`Role ${roleName} not found`);
  }

  const { data: existingRole } = await supabase
    .from("user_roles")
    .select("user_role_id")
    .eq("user_id", userId)
    .eq("role_id", role.role_id)
    .eq("is_active", true)
    .maybeSingle();

  if (existingRole) {
    throw new Error("User already has this role");
  }

  const { data, error } = await supabase
    .from("user_roles")
    .insert({
      user_id: userId,
      role_id: role.role_id,
      assigned_by: adminUserId,
      expires_at: expiresAt || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeRole(userId: string, roleId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_roles")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("role_id", roleId);

  if (error) throw error;
  return { success: true };
}

function generatePassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
