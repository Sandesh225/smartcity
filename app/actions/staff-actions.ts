'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function inviteStaffMember(formData: {
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
}) {
  // This would use the Supabase Service Role Client
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // Create user with admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: generateTemporaryPassword(),
      email_confirm: true,
      user_metadata: {
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
      },
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        email_verified: true,
        status: 'active',
      });

    if (profileError) throw profileError;

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: await getRoleId(formData.role),
        is_active: true,
      });

    if (roleError) throw roleError;

    return { success: true, userId };
  } catch (error) {
    console.error('Error creating staff member:', error);
    return { success: false, error: error.message };
  }
}

export async function assignStaffToWardDept(formData: {
  userId: string;
  wardId?: string;
  departmentId?: string;
  roleInAssignment: string;
  canApproveComplaints: boolean;
  canAssignComplaints: boolean;
}) {
  const supabase = await createClient();

  try {
    const { data: assignment, error } = await supabase
      .from('staff_assignments')
      .insert({
        user_id: formData.userId,
        ward_id: formData.wardId || null,
        department_id: formData.departmentId || null,
        role_in_assignment: formData.roleInAssignment,
        can_approve_complaints: formData.canApproveComplaints,
        can_assign_complaints: formData.canAssignComplaints,
        is_primary_assignment: true,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, assignment };
  } catch (error) {
    console.error('Error assigning staff:', error);
    return { success: false, error: error.message };
  }
}

// Helper functions
function generateTemporaryPassword(): string {
  return Math.random().toString(36).slice(-8);
}

async function getRoleId(roleName: string): Promise<string> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('roles')
    .select('role_id')
    .eq('role_name', roleName)
    .single();

  if (error) throw error;
  return data.role_id;
}