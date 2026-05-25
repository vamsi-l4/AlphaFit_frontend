import { useEffect, useState } from 'react';
import api from '../utils/api';
import { BellRingIcon } from './Icons';

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
                style={{ padding: '6px', position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
                onClick={() => setShowNotifs(!showNotifs)}
            >
                <BellRingIcon width={24} height={24} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '4px', right: '6px', width: '10px', height: '10px',
                        backgroundColor: 'var(--red)', borderRadius: '50%', border: '2px solid var(--bg-primary)'
                    }} />
                )}
            </button>

            {showNotifs && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '90%', maxWidth: '360px', maxHeight: '70vh', overflowY: 'auto', padding: '20px', position: 'relative', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                        <button onClick={() => setShowNotifs(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', fontSize: '20px', padding: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', textAlign: 'center', fontWeight: 'bold' }}>Notifications</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {notifications.length === 0 ? (
                                <p className="text-muted text-sm text-center" style={{ margin: '20px 0' }}>No new notifications</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} style={{
                                        padding: '16px', borderRadius: '12px',
                                        background: n.isRead ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                                        border: n.isRead ? '1px solid var(--border-light)' : '1px solid var(--accent)'
                                    }}>
                                        <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px', color: 'var(--text-primary)' }}>{n.title}</div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{n.message}</div>
                                        {!n.isRead && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                                className="btn-primary"
                                                style={{ marginTop: '12px', padding: '6px 12px', fontSize: '12px', width: '100%', borderRadius: '6px' }}
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}