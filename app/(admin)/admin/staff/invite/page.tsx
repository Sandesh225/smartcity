// app/(admin)/admin/staff/invite/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STAFF_ROLES = [
  { value: "staff", label: "Staff Member" },
  { value: "field_worker", label: "Field Worker" },
  { value: "supervisor", label: "Supervisor" },
  { value: "department_head", label: "Department Head" },
  { value: "ward_head", label: "Ward Head" },
  { value: "admin", label: "Administrator" },
];

export default function InviteStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    userId: string;
    tempPassword: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
    role: "staff",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/staff/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create staff member");
      }

      setSuccess({
        userId: data.userId,
        tempPassword: data.tempPassword,
      });

      setFormData({
        email: "",
        fullName: "",
        phoneNumber: "",
        role: "staff",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title text-lg">Invite Staff Member</h2>
            <p className="card-subtitle">
              Create accounts for staff members, field workers, supervisors, and
              administrators
            </p>
          </div>
          <Link href="/admin/staff" className="btn-secondary">
            ← Back to Staff
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
            <div className="font-semibold mb-1">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300">
            <div className="font-semibold mb-2">Success!</div>
            <div className="text-sm mb-3">
              Staff member invited successfully. Share this temporary password
              securely:
            </div>
            <div className="bg-bg-elevated p-3 rounded border border-green-500/30 font-mono text-sm break-all">
              {success.tempPassword}
            </div>
            <div className="text-xs mt-3 text-muted">
              User ID: {success.userId}
            </div>
            <button
              onClick={() => {
                router.push("/admin/staff");
                router.refresh();
              }}
              className="btn-primary mt-3"
            >
              Go to Staff Management
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-muted mb-2"
              >
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-muted mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                placeholder="+977..."
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-muted mb-2"
              >
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/admin/staff" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Staff Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
