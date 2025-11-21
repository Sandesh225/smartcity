// app/(citizen)/citizen/notifications/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Bell, BellOff, Check, Eye, Loader2, Megaphone } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  useCitizenNotifications,
  markNotificationRead,
  type NotificationRow,
} from "@/hooks/useCitizenNotifications";

// -------------------------------
// Main Page Component
// -------------------------------
export default function NotificationsPage() {
  const { user } = useAuth();
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 20;

  const { notifications, loading, hasMore, setNotifications } =
    useCitizenNotifications(user?.id ?? null, pageSize, pageIndex);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (n) => !n.is_read && n.user_id !== null // only per-user count
      ).length,
    [notifications]
  );
  const totalCount = notifications.length;

  const handleMarkAsRead = async (notification: NotificationRow) => {
    if (!user?.id || notification.is_read || notification.user_id === null) {
      // don't mark broadcast as read globally; UI handles it locally
      return;
    }

    try {
      await markNotificationRead(user.id, notification);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    const unread = notifications.filter(
      (n) => !n.is_read && n.user_id !== null
    );
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map((n) => markNotificationRead(user.id, n)));

      setNotifications((prev) =>
        prev.map((n) =>
          !n.is_read && n.user_id !== null
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // -------------------------------
  // Loading state (first load)
  // -------------------------------
  if (loading && pageIndex === 0) {
    return (
      <Card>
        <LoadingSpinner text="Loading notifications..." />
      </Card>
    );
  }

  // -------------------------------
  // Empty state
  // -------------------------------
  if (notifications.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={BellOff}
          title="No notifications"
          description="You don't have any notifications yet. We'll notify you when there are updates on your complaints or new city-wide notices."
          actionLabel="View My Complaints"
          actionHref="/citizen/complaints"
        />
      </Card>
    );
  }

  // -------------------------------
  // Main UI
  // -------------------------------
  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <CardHeader
            title="Notifications"
            subtitle={
              unreadCount > 0
                ? `${unreadCount} unread · ${totalCount} total`
                : `${totalCount} notifications`
            }
          />

          <div className="flex items-center gap-2 pr-4">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/20 transition"
              >
                <Check className="w-3 h-3" />
                Mark all as read
              </button>
            )}

            <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Bell className="w-3 h-3 text-emerald-300" />
                {unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
              </span>
            </span>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>

      {/* Pagination */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setPageIndex((p) => p + 1)}
            disabled={loading}
            className="btn-secondary inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// -------------------------------
// Notification Card Component
// -------------------------------
function NotificationCard({
  notification,
  onMarkAsRead,
}: {
  notification: NotificationRow;
  onMarkAsRead: (n: NotificationRow) => void;
}) {
  const isBroadcast = notification.user_id === null;
  const isNotice = notification.notification_type === "notice";
  const isUnread = !notification.is_read && !isBroadcast;

  const Icon = isNotice ? Megaphone : Bell;

  return (
    <div
      className={`card group cursor-pointer p-4 transition-all ${
        isUnread
          ? "border-emerald-800/60 bg-emerald-950/25 hover:border-emerald-600/80"
          : "border-slate-800/50 bg-slate-900/50 hover:border-slate-600/70"
      }`}
      onClick={() => {
        if (isUnread) onMarkAsRead(notification);
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
            isNotice
              ? "bg-emerald-500/15"
              : isUnread
              ? "bg-emerald-500/20"
              : "bg-slate-700/60"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              isNotice
                ? "text-emerald-300"
                : isUnread
                ? "text-emerald-400"
                : "text-slate-400"
            }`}
          />
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-100">
              {notification.title}
            </h3>
            {isUnread && (
              <span className="mt-0.5 flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
            )}
          </div>

          {isBroadcast && (
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-emerald-300/80">
              City-wide notice
            </p>
          )}

          <p className="mb-2 text-sm text-slate-300">{notification.message}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span>{new Date(notification.created_at).toLocaleString()}</span>

            {notification.action_url && (
              <Link
                href={notification.action_url}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isUnread) onMarkAsRead(notification);
                }}
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
              >
                <Eye className="w-3 h-3" />
                View details
              </Link>
            )}

            {/* Only allow marking read for per-user notifications */}
            {isUnread && !isBroadcast && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification);
                }}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400"
              >
                <Check className="w-3 h-3" />
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------
// Placeholder components (simple layout shell)
// -------------------------------
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="card rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}

function LoadingSpinner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 py-4 text-slate-300">
      <Loader2 className="h-4 w-4 animate-spin" />
      {text}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: any;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center space-y-3 p-8 text-center">
      <Icon className="h-10 w-10 text-slate-500" />

      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>

      <p className="max-w-sm text-sm text-slate-400">{description}</p>

      {actionHref && (
        <Link
          href={actionHref}
          className="mt-2 inline-flex items-center rounded-md bg-emerald-700 px-4 py-2 text-xs font-medium text-slate-900 hover:bg-emerald-600"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
