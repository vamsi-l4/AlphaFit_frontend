import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Payments from './pages/admin/Payments';
import AdminWorkouts from './pages/admin/AdminWorkouts.jsx';

// Member pages
import Home from './Home.jsx';
import MemberLogin from './pages/member/MemberLogin';
import MemberProfile from './pages/member/MemberProfile';
import Workouts from './pages/member/Workouts.jsx';

const MemberLayoutWrapper = () => (
  <Layout bottomNav headerProps={{ logoutTo: '/member/login' }}>
    <Outlet />
  </Layout>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<AdminLogin />} />
          <Route path="/member/login" element={<MemberLogin />} />
          {/* Admin Protected */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>
          } />
          <Route path="/admin/members" element={
            <ProtectedRoute role="admin"><Members /></ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute role="admin"><Payments /></ProtectedRoute>
          } />
          <Route path="/admin/workouts" element={
            <ProtectedRoute role="admin"><AdminWorkouts /></ProtectedRoute>
          } />

          {/* Member Protected with Layout */}
          <Route element={<ProtectedRoute role="member"><MemberLayoutWrapper /></ProtectedRoute>}>
            <Route path="/member/dashboard" element={<Home />} />
            <Route path="/member/profile" element={<MemberProfile />} />
            
            {/* Workouts Flow */}
            <Route path="/workouts" element={<Workouts />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
