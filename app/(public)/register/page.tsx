
// FILE: app/(public)/register/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';
import Link from 'next/link';
import { AlertCircle, Loader2, Check } from 'lucide-react';
import { useWards } from '@/hooks/useWards';

export default function RegisterPage() {
  const router = useRouter();
  const { wards } = useWards();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [wardId, setWardId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const passwordStrength = calculatePasswordStrength(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('Please agree to the terms and conditions.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabaseBrowser.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || null,
            ward_id: wardId || null,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Success - redirect to login with success flag
      router.push('/login?registered=1');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="card p-8 lg:p-12 bg-slate-900/60 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="logo-pill w-10 h-10">SC</div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400">Smart City</div>
                <div className="text-sm font-semibold text-slate-100">Pokhara Portal</div>
              </div>
            </Link>

            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Create Citizen Account
            </h2>
            <p className="text-sm text-slate-400">
              Register to submit and track city complaints
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-300">Registration failed</p>
                  <p className="text-xs text-red-400/70 mt-0.5">{errorMsg}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                placeholder="Enter your full name"
                disabled={loading}
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                placeholder="98XXXXXXXX"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            {/* Ward Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Ward (Optional)
              </label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                disabled={loading}
              >
                <option value="">Select your ward...</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    Ward {ward.ward_number} - {ward.ward_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                placeholder="Create a strong password"
                autoComplete="new-password"
                disabled={loading}
                required
              />
              {password && (
                <PasswordStrengthIndicator strength={passwordStrength} />
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                disabled={loading}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                disabled={loading}
              />
              <label htmlFor="terms" className="text-xs text-slate-300">
                I agree to the{' '}
                <a href="/terms" className="text-emerald-400 hover:text-emerald-300">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-emerald-400 hover:text-emerald-300">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordStrengthIndicator({ strength }: { strength: number }) {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-emerald-500',
  ];

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength - 1] : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={`text-xs ${strength >= 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
          Password strength: {labels[strength - 1]}
        </p>
      )}
    </div>
  );
}

function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  return Math.min(strength, 4);
}
