// components/admin/UserList.tsx
"use client";

interface UserListProps {
  users: any[];
}

export function UserList({ users }: UserListProps) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Ward</th>
            <th>Roles</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.full_name}</td>
                <td className="text-muted">
                  {u.wards
                    ? `Ward ${u.wards.ward_number} - ${u.wards.ward_name}`
                    : "—"}
                </td>
                <td className="text-xs">
                  {u.user_roles
                    ?.map((ur: any) => ur.roles.role_name)
                    .join(", ")}
                </td>
                <td className="text-muted">{u.phone_number || "—"}</td>
                <td>
                  <span
                    className={`badge-status ${
                      u.status === "active" ? "resolved" : "closed"
                    }`}
                  >
                    <span className="badge-dot" />
                    {u.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-muted py-8">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
