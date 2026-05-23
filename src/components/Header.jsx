import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import alphaFitLogo from '../assets/AlphaFitFULLLOGO-removebg.png';

export default function Header({ logoutTo = '/', mobileOnly = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(logoutTo);
  };

  return (
    <header className={`header ${mobileOnly ? 'mobile-only' : ''}`}>
      <div className="container">
        <img className="header-logo" src={alphaFitLogo} alt="Alpha Fit Logo" style={{ height: '40px', width: 'auto', marginLeft: '-25px' }} />
        {user && (
          <div className="header-user">
            <NotificationBell />
            <span className="text-muted">{user.name}</span>
            <button className="btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
