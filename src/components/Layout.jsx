import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout({ children, sidebar = false, bottomNav = false, headerProps, mobileHeaderOnly = false }) {
  return (
    <div className={`layout ${sidebar ? 'layout-with-sidebar' : ''}`}>
      <Header {...headerProps} mobileOnly={mobileHeaderOnly} />
      <div className="layout-body">
        {sidebar && (
          <aside className="layout-sidebar" aria-label="Primary navigation">
            <Sidebar />
          </aside>
        )}
        <main className="layout-main" style={bottomNav ? { paddingBottom: '80px' } : {}}>
          <div className="layout-content">
            {children}
          </div>
        </main>
      </div>
      {bottomNav && <BottomNav />}
    </div>
  );
}
