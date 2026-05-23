import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((current) => current.map((notification) => (
        notification.notification_id === id
          ? { ...notification, is_read: true }
          : notification
      )));
    } catch (error) {
      console.error('Could not mark notification read', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="notification-wrapper">
      <button className="notification-button" type="button" onClick={() => setOpen((prev) => !prev)}>
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <span>Notifications</span>
            <button type="button" className="btn-ghost btn-sm" onClick={loadNotifications}>
              Refresh
            </button>
          </div>

          {loading && <div className="text-muted">Loading notifications…</div>}
          {!loading && notifications.length === 0 && (
            <div className="notification-empty">No notifications available</div>
          )}

          {!loading && notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`notification-item ${notification.is_read ? '' : 'notification-item-unread'}`}
            >
              <div>
                <div className="notification-item-title">{notification.title}</div>
                <div className="notification-item-message">{notification.message}</div>
                <div className="notification-item-meta">
                  {new Date(notification.created_at).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {!notification.is_read && (
                <button className="btn-secondary btn-sm" type="button" onClick={() => markRead(notification.notification_id)}>
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
