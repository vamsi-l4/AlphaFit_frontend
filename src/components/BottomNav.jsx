import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/members', label: 'Members', icon: '👥' },
    { path: '/admin/payments', label: 'Payments', icon: '💳' },
    { path: '/admin/workouts', label: 'Workouts', icon: '🏋️' },
];

const memberNavItems = [
    { path: '/member/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/workouts', label: 'Workouts', icon: '💪' },
    { path: '/member/profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav() {
    const { user } = useAuth();
    const navItems = user?.role === 'admin' ? adminNavItems : memberNavItems;

    return (
        <nav className="bottom-nav" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-around',
            zIndex: 1000,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
        }}>
            {navItems.map(({ path, label, icon }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                    style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        textDecoration: 'none', color: isActive ? 'var(--accent)' : 'var(--text-muted)', flex: 1
                    })}
                >
                    <span className="nav-icon" style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</span>
                    <span className="nav-label" style={{ fontSize: '12px', fontWeight: 500 }}>{label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
