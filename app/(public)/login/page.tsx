
// FILE: app/(public)/login/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';
import { getDefaultPortalPath, isNextAllowedForRole, type UserRole } from '@/lib/role-redirect';
import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const registeredFlag = searchParams.get('registered') === '1';
  const nextParam = searchParams.get('next') || '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();

      if (userError || !user) {
        setErrorMsg('Could not load user information after login.');
        return;
      }

      const { data: profile, error: profileError } = await supabaseBrowser
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError || !profile?.role) {
        setErrorMsg('Your profile could not be found. Please contact support.');
        return;
      }

      const role = profile.role as UserRole;
      let target = getDefaultPortalPath(role);

      if (nextParam && isNextAllowedForRole(nextParam, role)) {
        target = nextParam;
      }

      router.push(target);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Branding */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="logo-pill w-12 h-12 text-xl">SC</div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Smart City</div>
              <div className="text-xl font-semibold text-slate-100">Pokhara Portal</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-100 leading-tight">
            Welcome back to your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              citizen portal
            </span>
          </h1>

          <p className="text-slate-400 text-lg">
            Track complaints, receive updates, and stay connected with city services.
          </p>

          <div className="pt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Real-time complaint tracking</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Instant notifications</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Secure and private</span>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="w-full">
          <div className="card p-8 lg:p-12 bg-slate-900/60 backdrop-blur-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                Sign in to continue
              </h2>
              <p className="text-sm text-slate-400">
                Enter your credentials to access your citizen portal
              </p>
            </div>

            {/* Success Message */}
            {registeredFlag && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/50">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-300">Account created successfully!</p>
                    <p className="text-xs text-emerald-400/70 mt-0.5">Please sign in to continue to your dashboard.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-red-300">Sign in failed</p>
                    <p className="text-xs text-red-400/70 mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Redirect Info */}
            {nextParam && (
              <div className="mb-6 p-4 rounded-xl bg-blue-950/50 border border-blue-800/50">
                <p className="text-xs text-blue-300">
                  You need to sign in to access: <span className="font-mono text-blue-200">{nextParam}</span>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Create citizen account
                </Link>
              </p>
              <p className="text-xs text-slate-500 mt-3">
                Staff and admin accounts are created by the Metropolitan City.
                Contact IT section for access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}