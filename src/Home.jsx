import { useEffect, useState } from 'react';
import api from './utils/api';
import { Link } from 'react-router-dom';
import { DumbbellIcon, WalletAltIcon } from './components/Icons';

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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {data.photo && <img src={data.photo} className="avatar-lg" alt="Profile" />}
                    <div>
                        <h1 className="page-title">Member Dashboard</h1>
                        <div className="page-subtitle">Welcome back, {data.name}</div>
                    </div>
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

                <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="stat-label">Expiry Date</div>
                    <div className="stat-value" style={{ fontSize: 'clamp(18px, 5vw, 24px)' }}>
                        {new Date(data.expiryDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '32px' }}>
                <div className="stat-label uppercase text-muted text-xs tracking-wide font-bold mb-2" style={{ marginBottom: '12px' }}>
                    Quick Actions
                </div>
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr' }}>
                    <Link to="/workouts" className="quick-action-btn">
                        <div className="quick-action-icon-wrapper">
                            <DumbbellIcon width={24} height={24} />
                        </div>
                        Start a Workout
                    </Link>
                    <Link to="/member/profile" className="quick-action-btn">
                        <div className="quick-action-icon-wrapper">
                            <WalletAltIcon width={24} height={24} />
                        </div>
                        View Payment History
                    </Link>
                </div>
            </div>
        </div>
    );
}