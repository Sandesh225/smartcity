'use client';

import type { NotificationRow } from '@/hooks/useCitizenNotifications';

type Props = {
  notifications: NotificationRow[];
  loading: boolean;
  onClick: (n: NotificationRow) => void;
  language: 'en' | 'np';
  fullHeight?: boolean;
};

export function NotificationsPanel({
  notifications,
  loading,
  onClick,
  language,
  fullHeight,
}: Props) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="card complaints-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            {language === 'en' ? 'Notifications' : 'सूचनाहरू'}
          </h3>
          <p className="card-subtitle">
            {language === 'en'
              ? 'Updates about your complaints'
              : 'आपकै गुनासोका विषयमा अपडेटहरू'}
          </p>
        </div>
        {unreadCount > 0 && <div className="unread-badge">{unreadCount}</div>}
      </div>

      <div className={`notifications-list ${fullHeight ? 'expanded' : ''}`}>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-12 rounded-lg" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <p className="empty-state-title">
              {language === 'en'
                ? 'No notifications yet'
                : 'अभी कुनै सूचना नै छैन'}
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onClick(n)}
              className={`notification-item ${!n.is_read ? 'unread' : ''}`}
            >
              <div className="notification-marker">
                {!n.is_read && <div className="unread-dot" />}
              </div>
              <div className="notification-content">
                <div className="notification-title">{n.title}</div>
                <p className="notification-message">{n.message}</p>
                <div className="notification-time">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              <div className="notification-arrow">→</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
