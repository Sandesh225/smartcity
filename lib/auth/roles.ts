export type UserRole = 
  | 'citizen' 
  | 'staff' 
  | 'field_worker' 
  | 'supervisor' 
  | 'department_head' 
  | 'ward_head' 
  | 'admin' 
  | 'super_admin';

export const rolePriority: Record<UserRole, number> = {
  citizen: 1,
  staff: 2,
  field_worker: 3,
  supervisor: 4,
  department_head: 5,
  ward_head: 6,
  admin: 7,
  super_admin: 8,
};

export function hasMinRole(
  effectiveRole: UserRole | null | undefined,
  required: UserRole
): boolean {
  if (!effectiveRole) return false;
  return rolePriority[effectiveRole] >= rolePriority[required];
}

export function homeForRole(role: UserRole | null | undefined): string {
  if (!role) return '/citizen';

  if (role === 'admin' || role === 'super_admin') return '/admin';

  if (
    ['staff', 'field_worker', 'supervisor', 'department_head', 'ward_head'].includes(
      role
    )
  ) return '/staff';

  return '/citizen';
}