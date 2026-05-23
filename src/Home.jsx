import { useEffect, useState } from 'react';
import api from './utils/api';
import { Link } from 'react-router-dom';

export default function Home() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/members/dashboard')
            .then(res => setData(res.data))
            .catch(err => console.error("Error loading dashboard:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading">LOADING...</div>;
    if (!data) return <div className="layout-content"><div className="alert alert-danger">Failed to load dashboard. Please try logging in again.</div></div>;

    return (
        <div className="layout-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Member Dashboard</h1>
                    <div className="page-subtitle">Welcome back, {data.name}</div>
                </div>
                {data.photo && <img src={data.photo} className="avatar-lg" />}
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