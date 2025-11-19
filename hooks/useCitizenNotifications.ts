import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';

export type NotificationRow = {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  notification_type: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
};

export function useCitizenNotifications(
  userId: string | null,
  pageSize: number,
  pageIndex: number
) {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabaseBrowser.rpc(
        'get_user_notifications',
        {
          limit_rows: pageSize,
          offset_rows: pageIndex * pageSize,
        }
      );
      setLoading(false);
      if (error || !data) return;
      setNotifications(data as NotificationRow[]);
      setHasMore(data.length === pageSize);
    })();
  }, [userId, pageSize, pageIndex]);

  return { notifications, loading, hasMore, setNotifications };
}

export async function markNotificationRead(
  userId: string | null,
  notification: NotificationRow
) {
  if (!userId) return;
  // ❗ Skip broadcast notifications (user_id IS NULL)
  if (!notification.user_id || notification.user_id !== userId) return;

  const { error } = await supabaseBrowser
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notification.id);
  if (error) {
    throw error;
  }
}
