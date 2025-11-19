


// FILE: app/(citizen)/citizen/notifications/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCitizenNotifications, markNotificationRead } from '@/hooks/useCitizenNotifications';
import { Bell, BellOff, Check, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 20;

  const { notifications, loading, hasMore, setNotifications } = useCitizenNotifications(
    user?.id || null,
    pageSize,
    pageIndex
  );

  const handleMarkAsRead = async (notification: any) => {
    if (notification.is_read) return;

    try {
      await markNotificationRead(user?.id || null, notification);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  if (loading && pageIndex === 0) {
    return (
      <Card>
        <LoadingSpinner text="Loading notifications..." />
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={BellOff}
          title="No notifications"
          description="You don't have any notifications yet. We'll notify you when there are updates on your complaints."
          actionLabel="View My Complaints"
          actionHref="/citizen/complaints"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Notifications"
          subtitle={`${notifications.filter((n) => !n.is_read).length} unread`}
        />
      </Card>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPageIndex((p) => p + 1)}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkAsRead,
}: {
  notification: any;
  onMarkAsRead: (n: any) => void;
}) {
  return (
    <div
      className={`card p-4 transition-all ${
        !notification.is_read
          ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-700/60'
          : 'bg-slate-900/40 border-slate-800/40 hover:border-slate-700/60'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            !notification.is_read ? 'bg-emerald-500/20' : 'bg-slate-700/50'
          }`}
        >
          <Bell className={`w-5 h-5 ${!notification.is_read ? 'text-emerald-400' : 'text-slate-400'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-sm font-semibold text-slate-100">{notification.title}</h3>
            {!notification.is_read && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>

          <p className="text-sm text-slate-300 mb-2">{notification.message}</p>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{new Date(notification.created_at).toLocaleString()}</span>
            {notification.action_url && (
              <Link
                href={notification.action_url}
                onClick={() => onMarkAsRead(notification)}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                View Details
              </Link>
            )}
            {!notification.is_read && (
              <button
                onClick={() => onMarkAsRead(notification)}
                className="text-slate-400 hover:text-emerald-400 flex items-center gap-1"
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