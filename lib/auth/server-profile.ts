import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function requireSessionAndProfile(redirectNext?: string) {
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

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    if (redirectNext) {
      redirect(`/login?next=${encodeURIComponent(redirectNext)}`);
    }
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, role')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    redirect('/login');
  }

  return { supabase, session, profile };
}