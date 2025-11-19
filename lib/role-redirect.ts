// lib/role-redirect.ts
export type UserRole = 'citizen' | 'staff' | 'admin' | 'super_admin';

/**
 * Get the default portal path for a given user role
 */
export function getDefaultPortalPath(role: UserRole): string {
  switch (role) {
    case 'citizen':
      return '/citizen/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'super_admin':
      return '/super-admin/dashboard';
    default:
      return '/login';
  }
}

/**
 * Check if a "next" redirect path is allowed for a given role
 */
export function isNextAllowedForRole(next: string, role: UserRole): boolean {
  if (!next || !next.startsWith('/')) return false;

  const allowedPrefixesByRole: Record<UserRole, string[]> = {
    citizen: ['/citizen'],
    staff: ['/staff'],
    admin: ['/admin', '/staff'],
    super_admin: ['/super-admin', '/admin', '/staff', '/citizen'],
  };

  const allowedPrefixes = allowedPrefixesByRole[role];

  return allowedPrefixes.some((prefix) => next.startsWith(prefix));
}

/**
 * Check if a user has access to a specific route based on their role
 */
export function hasRouteAccess(path: string, role: UserRole): boolean {
  if (path.startsWith('/citizen')) return role === 'citizen' || role === 'super_admin';
  if (path.startsWith('/staff')) return ['staff', 'admin', 'super_admin'].includes(role);
  if (path.startsWith('/admin')) return ['admin', 'super_admin'].includes(role);
  if (path.startsWith('/super-admin')) return role === 'super_admin';
  
  return true; // Public routes
}