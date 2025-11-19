import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

export default async function SuperAdminDashboardPage() {
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
            // Ignore
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

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h1 className="card-title">
            Welcome, {profile?.full_name ?? 'Super Admin'}
          </h1>
          <p className="card-subtitle">
            You have full system access across all Smart City Pokhara modules.
          </p>
        </div>
        <span className="badge-priority high text-[11px]">
          Role: {profile?.role ?? 'super_admin'}
        </span>
      </div>
      <p className="text-muted mt-2">
        From here you will manage global configuration, roles, permissions, and
        advanced analytics for the entire metropolitan system.
      </p>
    </section>
  );
}