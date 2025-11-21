// components/admin/AdminNotificationsClient.tsx
"use client";

import { useState } from "react";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  channel?: string | null;
  category?: string | null;
  status?: string | null;
  created_at: string;
  sent_at?: string | null;
  target_user_id?: string | null;
  target_role?: string | null;
}

interface Props {
  initialNotifications: NotificationRow[];
}

export function AdminNotificationsClient({
  initialNotifications,
}: Props) {
  const [rows, setRows] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    target_role: "citizen",
    channel: "push",
  });

  const sendNotification = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setRows((prev) => [data.notification, ...prev]);
      setForm({ ...form, title: "", body: "" });
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title text-base">Notifications</h1>
            <p className="card-subtitle text-xs text-muted">
              Broadcast critical updates to citizens and staff.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4 pt-0">
          <div className="space-y-2">
            <label className="block text-xs text-muted mb-1">
              Title *
            </label>
            <input
              className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <label className="block text-xs text-muted mb-1 mt-3">
              Body *
            </label>
            <textarea
              className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm min-h-[100px]"
              value={form.body}
              onChange={(e) =>
                setForm({ ...form, body: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs text-muted mb-1">
                  Target Role
                </label>
                <select
                  className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm"
                  value={form.target_role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      target_role: e.target.value,
                    })
                  }
                >
                  <option value="citizen">Citizens</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admins</option>
                  <option value="all">Everyone</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">
                  Channel
                </label>
                <select
                  className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm"
                  value={form.channel}
                  onChange={(e) =>
                    setForm({ ...form, channel: e.target.value })
                  }
                >
                  <option value="push">Push</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="btn-primary"
                disabled={loading}
                onClick={sendNotification}
              >
                {loading ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>

          <div className="text-xs text-muted space-y-2">
            <p>
              Use this panel to broadcast important alerts like water
              supply issues, road closures, or emergency updates. Delivery
              rules are handled by the backend notification service.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title text-sm">Recent Notifications</h2>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Audience</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-muted py-6"
                  >
                    No notifications yet
                  </td>
                </tr>
              ) : (
                rows.map((n) => (
                  <tr key={n.id}>
                    <td className="font-medium text-sm">{n.title}</td>
                    <td className="text-xs text-muted">
                      {n.channel || "default"}
                    </td>
                    <td className="text-xs">
                      <span
                        className={`badge-status ${
                          n.status === "sent"
                            ? "resolved"
                            : n.status === "pending"
                            ? "new"
                            : "closed"
                        }`}
                      >
                        <span className="badge-dot" />
                        {n.status || "unknown"}
                      </span>
                    </td>
                    <td className="text-xs text-muted">
                      {n.target_role || (n.target_user_id ? "user" : "—")}
                    </td>
                    <td className="text-xs text-muted">
                      {new Date(n.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
