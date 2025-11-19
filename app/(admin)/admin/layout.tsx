// app/(admin)/admin/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  getDefaultPortalPath,
  type UserRole,
} from '@/lib/role-redirect';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { LogoutButton } from '@/components/auth/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?next=/admin/dashboard');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, role')
    .eq('id', session.user.id)
    .single();

  if (!profile || !profile.role) {
    redirect('/login');
  }

  const role = profile.role as UserRole;

  // admin panel allowed for admin + super_admin
  if (!['admin', 'super_admin'].includes(role)) {
    redirect(getDefaultPortalPath(role));
  }

  return (
    <div className="dashboard-root">
      <div className="dashboard-shell">
        <header className="dashboard-nav">
          <div className="nav-left">
            <div className="logo-pill">SC</div>
            <div className="logo-text">
              <span>Smart City Pokhara</span>
              <span>Admin Panel</span>
            </div>
          </div>
          <div className="nav-right">
            <span className="nav-pill text-xs">Role: {role}</span>
            <LogoutButton />
          </div>
        </header>

        <div className="dashboard-main">
          <EmailVerificationBanner />
          {children}
        </div>
      </div>
    </div>
  );
}