
// =====================================================================
// app/(citizen)/citizen/layout.tsx
// =====================================================================
import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { getDefaultPortalPath, type UserRole } from '@/lib/role-redirect';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { CitizenNav } from '@/components/navigation/CitizenNav';

export const dynamic = 'force-dynamic';

export default async function CitizenLayout({ children }: { children: ReactNode }) {
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
          } catch {}
        },
      },
    }
  );

  // ✅ Use getUser() instead of getSession()
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?next=/citizen/dashboard');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, role, email')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !profile.role) {
    redirect('/login');
  }

  const role = profile.role as UserRole;

  if (role !== 'citizen') {
    redirect(getDefaultPortalPath(role));
  }

  // Get unread notification count
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return (
    <div className="dashboard-root">
      <div className="dashboard-shell">
        <CitizenNav
          profile={profile}
          unreadNotifications={unreadCount || 0}
        />
        <div className="dashboard-main">
          <EmailVerificationBanner />
          {children}
        </div>
      </div>
    </div>
  );
}
