// hooks/useCitizenNotifications.ts
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type NotificationRow = {
  id: string;
  user_id: string | null; // null = broadcast (city-wide)
  title: string;
  message: string;
  notification_type: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  expires_at: string | null;
};

type UseCitizenNotificationsResult = {
  notifications: NotificationRow[];
  loading: boolean;
  hasMore: boolean;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationRow[]>>;
};

/**
 * Fetches citizen notifications with:
 * - Per-user notifications: user_id = <userId>
 * - Broadcast notifications: user_id IS NULL
 *
 * RLS is respected via Supabase client and session.
 */
export function useCitizenNotifications(
  userId: string | null,
  pageSize: number,
  pageIndex: number
): UseCitizenNotificationsResult {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // If not logged in yet, don't fetch
    if (!userId) {
      setNotifications([]);
      setHasMore(false);
      return;
    }

    let isCancelled = false;

    async function fetchPage() {
      setLoading(true);

      try {
        const from = pageIndex * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
          .from("notifications")
          .select(
            "id, user_id, title, message, notification_type, related_entity_type, related_entity_id, action_url, is_read, read_at, created_at, expires_at"
          )
          // 🔥 Include per-user + broadcast notifications
          .or(`user_id.eq.${userId},user_id.is.null`)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          console.error("useCitizenNotifications error:", error);
          if (!isCancelled) {
            if (pageIndex === 0) {
              setNotifications([]);
            }
            setHasMore(false);
          }
          return;
        }

        if (!data) {
          if (!isCancelled) {
            if (pageIndex === 0) {
              setNotifications([]);
            }
            setHasMore(false);
          }
          return;
        }

        if (isCancelled) return;

        if (pageIndex === 0) {
          // First page → replace
          setNotifications(data);
        } else {
          // Subsequent pages → append, avoiding duplicates
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const merged = [...prev];
            for (const row of data) {
              if (!existingIds.has(row.id)) merged.push(row);
            }
            return merged;
          });
        }

        setHasMore(data.length === pageSize);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchPage();

    return () => {
      isCancelled = true;
    };
  }, [userId, pageSize, pageIndex, supabase]);

  return {
    notifications,
    loading,
    hasMore,
    setNotifications,
  };
}

/**
 * Mark a single notification as read.
 * - Only meaningful for per-user notifications (user_id != null).
 * - For broadcast (user_id = null) we usually keep is_read = false globally,
 *   and in the UI we simply don't show "mark as read".
 */
export async function markNotificationRead(
  userId: string,
  notification: NotificationRow
) {
  const supabase = createClientComponentClient();

  if (!notification.id) return;

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notification.id)
    // safety: ensure current user has access
    .or(`user_id.eq.${userId},user_id.is.null`);

  if (error) {
    console.error("markNotificationRead error:", error);
    throw error;
  }
}
