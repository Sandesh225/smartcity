import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { getDefaultPortalPath, type UserRole } from '@/lib/role-redirect';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({
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
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore - middleware handles this
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?next=/super-admin/dashboard');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, role')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profile || !profile.role) {
    redirect('/login');
  }

  const role = profile.role as UserRole;

  if (role !== 'super_admin') {
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
              <span>Super Admin Panel</span>
            </div>
          </div>
          <div className="nav-right">
            <span className="nav-pill text-xs">Full system access</span>
          </div>
        </header>

        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}