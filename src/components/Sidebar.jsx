import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/members', label: 'Members', icon: '👥' },
  { path: '/admin/payments', label: 'Payments', icon: '💳' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          🏋️ Alpha Fit
        </div>
        <div className="sidebar-subtitle">Gym Management</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="sidebar-user">
        <div className="sidebar-user-label">Signed in as</div>
        <div className="sidebar-user-name">{user?.name}</div>
        <button
          onClick={handleLogout}
          className="btn-danger w-full text-sm font-medium flex items-center gap-2"
        >
          ↗ Sign Out
        </button>
      </div>
    </aside>
  );
}
