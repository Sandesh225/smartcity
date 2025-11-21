// FILE: app/(public)/register/page.tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useWards } from "@/hooks/useWards";
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { wards } = useWards();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wardId, setWardId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg("Please agree to the terms and conditions.");
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
        const msg = /User already registered/i.test(error.message)
          ? "An account with this email already exists. Try signing in instead."
          : error.message;
        setErrorMsg(msg);
        return;
      }

      // Success -> redirect to login with success flag
      router.push("/login?registered=1");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Branding (matches login) */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="logo-pill w-12 h-12 text-xl">SC</div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">
                Smart City
              </div>
              <div className="text-xl font-semibold text-slate-100">
                Pokhara Portal
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-100 leading-tight">
            Create your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              citizen account
            </span>
          </h1>

          <p className="text-slate-400 text-lg">
            Submit complaints, receive updates, and help keep Pokhara clean and
            well-managed.
          </p>

          <div className="pt-8 space-y-3">
            <Bullet>Simple, fast registration</Bullet>
            <Bullet>Ward-aware service routing</Bullet>
            <Bullet>Secure and private</Bullet>
          </div>
        </div>

        {/* Right: Register Form (same card style as login) */}
        <div className="w-full">
          <div className="card p-8 lg:p-12 bg-slate-900/60 backdrop-blur-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                Create Citizen Account
              </h2>
              <p className="text-sm text-slate-400">
                Register to submit and track city complaints
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <Banner
                tone="error"
                title="Registration failed"
                body={errorMsg}
                icon={<AlertCircle className="w-5 h-5 text-red-400" />}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <Field label="Full Name" required>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </Field>

              {/* Mobile Number */}
              <Field label="Mobile Number">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  placeholder="98XXXXXXXX"
                  disabled={loading}
                  inputMode="numeric"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Optional, for follow-ups from your ward.
                </p>
              </Field>

              {/* Email */}
              <Field label="Email Address" required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </Field>

              {/* Ward */}
              <Field label="Ward (Optional)">
                <select
                  value={wardId}
                  onChange={(e) => setWardId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={loading}
                >
                  <option value="">Select your ward...</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      Ward {ward.ward_number} — {ward.ward_name}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Password */}
              <Field label="Password" required>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all pr-10"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {password && (
                  <PasswordStrengthIndicator strength={passwordStrength} />
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Use 8+ chars with upper/lowercase, number, and symbol for best
                  strength.
                </p>
              </Field>

              {/* Confirm Password */}
              <Field label="Confirm Password" required>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all pr-10"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                    aria-label={
                      showConfirmPwd ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </Field>

              {/* Terms */}
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
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit */}
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
                  "Create Account"
                )}
              </button>
            </form>

            {/* Footer (mirrors login) */}
            <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-slate-500 mt-3">
                Staff and admin accounts are created by the Metropolitan City IT
                section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI bits (kept local for parity with login) ---------------- */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function Banner({
  tone,
  title,
  body,
  icon,
}: {
  tone: "error" | "success" | "info";
  title: string;
  body: string;
  icon?: React.ReactNode;
}) {
  const tones = {
    error: "bg-red-950/50 border-red-800/50",
    success: "bg-emerald-950/50 border-emerald-800/50",
    info: "bg-blue-950/50 border-blue-800/50",
  } as const;

  return (
    <div className={`mb-6 p-4 rounded-xl border ${tones[tone]}`}>
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <p className="text-xs font-medium text-slate-200">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{body}</p>
        </div>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <svg
          className="w-4 h-4 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span>{children}</span>
    </div>
  );
}

function PasswordStrengthIndicator({ strength }: { strength: number }) {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
  ];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength - 1] : "bg-slate-700"
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p
          className={`text-xs ${
            strength >= 3 ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          Password strength: {labels[strength - 1]}
        </p>
      )}
    </div>
  );
}

function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  return Math.min(score, 4);
}
