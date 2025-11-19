// components/auth/EmailVerificationBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';

type State =
  | { status: 'idle' | 'loading'; message?: string; error?: string }
  | { status: 'hidden' };

export function EmailVerificationBanner() {
  const [state, setState] = useState<State>({ status: 'idle' });
  const [email, setEmail] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabaseBrowser.auth.getUser();
      if (error || !data.user || cancelled) return;

      const user = data.user;
      setEmail(user.email ?? null);

      // Check if email is confirmed
      const confirmed = user.email_confirmed_at;

      if (!confirmed) {
        setNeedsVerification(true);
      } else {
        setState({ status: 'hidden' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleResend() {
    if (!email) return;
    setState({ status: 'loading' });

    try {
      const { error } = await supabaseBrowser.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        setState({
          status: 'idle',
          error:
            error.message ||
            'Could not resend verification email. Please try again.',
        });
        return;
      }

      setState({
        status: 'idle',
        message: 'Verification email has been resent. Please check your inbox.',
      });
    } catch (err: any) {
      setState({
        status: 'idle',
        error:
          err?.message ||
          'Something went wrong while resending the verification email.',
      });
    }
  }

  if (!needsVerification || state.status === 'hidden') {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">
            Please verify your email to secure your account.
          </p>
          <p className="text-[11px] text-amber-800/80">
            We&apos;ve sent a verification link to{' '}
            <span className="font-mono">{email}</span>. If you didn&apos;t
            receive it, you can resend it below.
          </p>
          {state.status === 'idle' && state.message && (
            <p className="mt-1 text-[11px] text-emerald-700">{state.message}</p>
          )}
          {state.status === 'idle' && state.error && (
            <p className="mt-1 text-[11px] text-red-600">{state.error}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleResend}
          disabled={state.status === 'loading'}
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {state.status === 'loading'
            ? 'Sending…'
            : 'Resend verification email'}
        </button>
      </div>
    </div>
  );
}