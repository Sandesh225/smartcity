// components/admin/StaffManagement.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Role {
  role_name: string;
  role_description: string | null;
}

interface UserRole {
  role_id: string;
  roles: Role;
}

interface Ward {
  ward_id: string;
  ward_name: string;
  ward_number: number;
}

interface Department {
  department_id: string;
  department_name: string;
}

interface Assignment {
  assignment_id: string;
  ward: Ward | null;
  department: Department | null;
  role_in_assignment: string;
  is_active: boolean;
}

interface StaffUser {
  id: string;
  full_name: string;
  phone_number: string | null;
  status: string;
  user_roles: UserRole[];
  staff_assignments: Assignment[];
}

interface StaffManagementProps {
  staffUsers: StaffUser[];
  wards: Ward[];
  departments: Department[];
}

export function StaffManagement({
  staffUsers,
  wards,
  departments,
}: StaffManagementProps) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const getPrimaryRole = (user: StaffUser): string => {
    if (!user.user_roles || user.user_roles.length === 0) return "Unknown";
    return user.user_roles[0].roles.role_name;
  };

  const getPrimaryAssignment = (user: StaffUser): string => {
    const primary = user.staff_assignments?.find((a) => a.is_active);
    if (!primary) return "Unassigned";

    if (primary.ward)
      return `Ward ${primary.ward.ward_number} - ${primary.ward.ward_name}`;
    if (primary.department) return primary.department.department_name;
    return "Unassigned";
  };

  const getRoleBadgeColor = (roleName: string): string => {
    const colors: Record<string, string> = {
      admin: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      super_admin: "bg-red-500/20 text-red-300 border-red-500/40",
      department_head: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      supervisor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      staff: "bg-green-500/20 text-green-300 border-green-500/40",
      field_worker: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      ward_head: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    };
    return (
      colors[roleName] ||
      "bg-gray-500/20 text-gray-300 border-gray-500/40"
    );
  };

  return (
    <>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Assignment</th>
              <th>Contact</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffUsers.length > 0 ? (
              staffUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.full_name}</td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                        getPrimaryRole(user)
                      )}`}
                    >
                      {getPrimaryRole(user).replace("_", " ")}
                    </span>
                  </td>
                  <td className="text-muted">
                    {getPrimaryAssignment(user)}
                  </td>
                  <td className="text-muted">
                    {user.phone_number || "—"}
                  </td>
                  <td>
                    <span
                      className={`badge-status ${
                        user.status === "active" ? "resolved" : "closed"
                      }`}
                    >
                      <span className="badge-dot" />
                      {user.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowAssignmentModal(true);
                      }}
                      className="chip hover:bg-green-500/20 hover:border-green-500/60 transition-colors"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-muted py-8">
                  No staff members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAssignmentModal && selectedUser && (
        <AssignmentModal
          user={selectedUser}
          wards={wards}
          departments={departments}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowAssignmentModal(false);
            setSelectedUser(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

interface AssignmentModalProps {
  user: StaffUser;
  wards: Ward[];
  departments: Department[];
  onClose: () => void;
  onSuccess: () => void;
}

function AssignmentModal({
  user,
  wards,
  departments,
  onClose,
  onSuccess,
}: AssignmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    wardId: "",
    departmentId: "",
    roleInAssignment: "",
    canApproveComplaints: false,
    canAssignComplaints: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.wardId && !formData.departmentId) {
      setError("Please select either a ward or department");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/staff-assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          ward_id: formData.wardId || null,
          department_id: formData.departmentId || null,
          role_in_assignment: formData.roleInAssignment,
          can_approve_complaints: formData.canApproveComplaints,
          can_assign_complaints: formData.canAssignComplaints,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create assignment");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-base">
              Assign {user.full_name}
            </h3>
            <button
              onClick={onClose}
              className="text-muted hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Ward (Optional)
              </label>
              <select
                value={formData.wardId}
                onChange={(e) =>
                  setFormData({ ...formData, wardId: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="">All Wards</option>
                {wards.map((ward) => (
                  <option key={ward.ward_id} value={ward.ward_id}>
                    Ward {ward.ward_number} - {ward.ward_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Department (Optional)
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    departmentId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Role in Assignment *
              </label>
              <input
                type="text"
                value={formData.roleInAssignment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roleInAssignment: e.target.value,
                  })
                }
                placeholder="e.g., Field Officer, Supervisor"
                required
                className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canApproveComplaints}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      canApproveComplaints: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-border-subtle bg-bg-elevated text-accent focus:ring-2 focus:ring-accent/50"
                />
                <span className="text-sm">Can Approve Complaints</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canAssignComplaints}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      canAssignComplaints: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-border-subtle bg-bg-elevated text-accent focus:ring-2 focus:ring-accent/50"
                />
                <span className="text-sm">Can Assign Complaints</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Assign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
