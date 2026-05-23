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
                        <div className="card" style={{
                            position: 'absolute', right: 0, top: '50px', width: '300px', zIndex: 1000,
                            maxHeight: '400px', overflowY: 'auto', padding: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>Notifications</h3>
                            {notifications.length === 0 ? (
                                <p className="text-muted text-sm text-center">No new notifications</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} style={{ 
                                        padding: '12px', marginBottom: '8px', borderRadius: '8px',
                                        background: n.isRead ? 'transparent' : 'var(--bg-secondary)',
                                        border: '1px solid var(--border-light)'
                                    }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{n.title}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{n.message}</div>
                                        {!n.isRead && (
                                            <button 
                                                onClick={() => handleMarkAsRead(n.id)} 
                                                className="btn-ghost text-accent text-xs" 
                                                style={{ marginTop: '8px', padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
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