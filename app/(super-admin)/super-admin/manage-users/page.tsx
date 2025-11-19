'use client';

import { FormEvent, useState } from 'react';

type RoleOption = 'staff' | 'admin';

export default function ManageUsersPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleOption>('staff');
  const [wardId, setWardId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Full name and email are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          role,
          ward_id: wardId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create user.');
        return;
      }

      setMessage(
        `User created successfully (${data.email}, role: ${data.role}). They will receive an email to set their password.`
      );
      setFullName('');
      setEmail('');
      setWardId('');
      setRole('staff');
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'Something went wrong. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h1 className="card-title">Create Staff/Admin User</h1>
          <p className="card-subtitle">
            Super Admin can create new staff and admin accounts for Smart City
            Pokhara.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {message && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-medium text-slate-200">
            Full name
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="e.g. Ramesh Gurung"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-200">
            Email address
          </label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="staff@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-200">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as RoleOption)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-200">
            Ward (optional)
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Ward ID (UUID) or leave blank"
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
          />
          <p className="text-[11px] text-slate-400">
            Later you can replace this free text with a dropdown of real wards.
          </p>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-75"
          >
            {loading ? 'Creating user…' : 'Create user'}
          </button>
        </div>
      </form>
    </section>
  );
}
