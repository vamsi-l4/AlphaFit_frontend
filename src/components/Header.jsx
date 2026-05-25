import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import alphaFitLogo from '../assets/AlphaFitFULLLOGO-removebg.png';
import { ArrowOutRightSquareHalfIcon } from './Icons';

export default function Header({ mobileOnly = false, logoutTo = '/' }) {
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
          <div className="header-user" style={{ display: 'flex', alignItems: 'center' }}>
            <NotificationBell />
            <button 
              className="btn-ghost"
              style={{ padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}
              onClick={handleLogout}
              title="Logout"
            >
              <ArrowOutRightSquareHalfIcon width={24} height={24} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
