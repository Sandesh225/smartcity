// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/role-redirect';

type AuthState = {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabaseBrowser.auth.getUser();

        if (cancelled) return;

        if (userError) {
          setState({ user: null, role: null, loading: false, error: userError.message });
          return;
        }

        if (!user) {
          setState({ user: null, role: null, loading: false, error: null });
          return;
        }

        // Fetch user profile to get role
        const { data: profile, error: profileError } = await supabaseBrowser
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (cancelled) return;

        if (profileError || !profile) {
          setState({ user, role: null, loading: false, error: 'Profile not found' });
          return;
        }

        setState({
          user,
          role: profile.role as UserRole,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        if (!cancelled) {
          setState({
            user: null,
            role: null,
            loading: false,
            error: err.message || 'Unknown error',
          });
        }
      }
    }

    fetchUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      
      if (!session?.user) {
        setState({ user: null, role: null, loading: false, error: null });
      } else {
        fetchUser();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

/**
 * Hook to require authentication and redirect if not authenticated
 */
export function useRequireAuth(redirectTo = '/login') {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push(redirectTo);
    }
  }, [auth.loading, auth.user, router, redirectTo]);

  return auth;
}