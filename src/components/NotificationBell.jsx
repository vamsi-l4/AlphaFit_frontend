import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        api.get('/notifications')
            .then(res => setNotifications(res.data.data || []))
            .catch(err => console.error("Error loading notifications:", err));
    }, []);

    const handleMarkAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await api.put(`/notifications/${id}/read`);
        } catch (err) {
            console.error("Error marking as read", err);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '16px' }}>
            <button 
                className="btn-ghost" 
                style={{ fontSize: '20px', padding: '6px', position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowNotifs(!showNotifs)}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '2px', right: '4px', width: '10px', height: '10px',
                        backgroundColor: 'var(--red)', borderRadius: '50%', border: '2px solid var(--bg-primary)'
                    }} />
                )}
            </button>

            {showNotifs && (
                <div style={{ position: 'absolute', top: '44px', right: '-10px', width: '320px', background: 'var(--bg-primary)', zIndex: 9999, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Notifications</h3>
                        <button onClick={() => setShowNotifs(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--text-muted)' }}>✕</button>
                    </div>
                    <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.length === 0 ? (
                            <p className="text-muted text-sm text-center" style={{ margin: '20px 0' }}>No new notifications</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} style={{ padding: '12px', borderRadius: '8px', background: n.isRead ? 'transparent' : 'var(--bg-secondary)', border: n.isRead ? '1px solid var(--border-light)' : '1px solid var(--accent)' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: 'var(--text-primary)' }}>{n.title}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{n.message}</div>
                                    {!n.isRead && <button onClick={(e) => handleMarkAsRead(n.id, e)} className="btn-primary" style={{ marginTop: '10px', padding: '6px 12px', fontSize: '12px', width: '100%', borderRadius: '6px' }}>Mark as Read</button>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}