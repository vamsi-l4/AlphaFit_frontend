import { useEffect, useState } from 'react';
import api from './utils/api';
import { Link } from 'react-router-dom';

export default function Home() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        api.get('/members/dashboard')
            .then(res => setData(res.data))
            .catch(err => console.error("Error loading dashboard:", err))
            .finally(() => setLoading(false));
            
        api.get('/notifications')
            .then(res => setNotifications(res.data.data || []))
            .catch(err => console.error("Error loading notifications:", err));
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Error marking as read", err);
        }
    };

    if (loading) return <div className="loading">LOADING...</div>;
    if (!data) return <div className="layout-content"><div className="alert alert-danger">Failed to load dashboard. Please try logging in again.</div></div>;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="layout-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {data.photo && <img src={data.photo} className="avatar-lg" alt="Profile" />}
                    <div>
                        <h1 className="page-title">Member Dashboard</h1>
                        <div className="page-subtitle">Welcome back, {data.name}</div>
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <button 
                        className="btn-ghost" 
                        style={{ fontSize: '24px', padding: '8px', position: 'relative', background: 'var(--bg-secondary)', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
                        onClick={() => setShowNotifs(!showNotifs)}
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '0px', right: '2px', width: '12px', height: '12px',
                                backgroundColor: 'var(--red)', borderRadius: '50%', border: '2px solid var(--bg-primary)'
                            }} />
                        )}
                    </button>

                    {showNotifs && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                            <div className="card" style={{ width: '90%', maxWidth: '360px', maxHeight: '70vh', overflowY: 'auto', padding: '20px', position: 'relative', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                                <button onClick={() => setShowNotifs(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-secondary)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
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
                                                        onClick={() => handleMarkAsRead(n.id)}
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
            </div>

            {data.alert && (
                <div className="alert alert-danger">
                    <strong>Notice:</strong> {data.alert}
                </div>
            )}

            <div className="grid">
                <div className="card stat-card">
                    <div className="stat-label">Membership Status</div>
                    <div className="stat-value">{data.daysLeft}</div>
                    <div className="stat-sub">Days Remaining</div>
                    <div className="stat-accent" style={{ background: data.daysLeft < 5 ? 'var(--red)' : 'var(--green)' }} />
                </div>

                <div className="card">
                    <div className="form-label">Expiry Date</div>
                    <div className="text-primary" style={{ fontSize: '18px', fontWeight: 600 }}>
                        {new Date(data.expiryDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '32px' }}>
                <div className="stat-label uppercase text-muted text-xs tracking-wide font-bold mb-2" style={{ marginBottom: '12px' }}>
                    Quick Actions
                </div>
                <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                    <Link to="/workouts" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '14px', borderRadius: '8px' }}>💪 Start a Workout</Link>
                    <Link to="/member/profile" className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center', padding: '14px', borderRadius: '8px' }}>💳 View Payment History</Link>
                </div>
            </div>
        </div>
    );
}