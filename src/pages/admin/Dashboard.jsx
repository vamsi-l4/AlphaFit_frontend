import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import StatCard from '../../components/StatCard';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, expiredMembers: 0, totalRevenue: 0, monthlyRevenue: 0, newMembersThisMonth: 0 });
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [res, workoutRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/workout/v2/all')
        ]);
        setStats(res.data.data);
        setTotalWorkouts(workoutRes.data.data ? workoutRes.data.data.length : 0);
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <AdminLayout><div className="loading">Loading business stats...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <div className="page-subtitle">Gym Overview</div>
      </div>
      <div className="grid">
        <Link to="/admin/payments" style={{ textDecoration: 'none' }}>
          <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} color="var(--text-primary)" accent="var(--accent)" />
        </Link>
        <Link to="/admin/payments" style={{ textDecoration: 'none' }}>
          <StatCard label="This Month Income" value={formatCurrency(stats.monthlyRevenue)} color="var(--green)" accent="var(--green)" />
        </Link>
        <Link to="/admin/members" style={{ textDecoration: 'none' }}>
          <StatCard label="Active Members" value={stats.activeMembers} color="var(--green)" accent="var(--green)" />
        </Link>
        <Link to="/admin/members" style={{ textDecoration: 'none' }}>
          <StatCard label="New Members (This Month)" value={stats.newMembersThisMonth} color="var(--blue)" accent="var(--blue)" />
        </Link>
        <Link to="/admin/members" style={{ textDecoration: 'none' }}>
          <StatCard label="Expired Members" value={stats.expiredMembers} color="var(--red)" accent="var(--red)" />
        </Link>
        <Link to="/admin/members" style={{ textDecoration: 'none' }}>
          <StatCard label="Total Members" value={stats.totalMembers} color="var(--text-primary)" />
        </Link>
        <Link to="/admin/workouts?manage=true" style={{ textDecoration: 'none' }}>
          <StatCard label="Total Workouts" value={totalWorkouts} color="var(--accent)" accent="var(--accent)" />
        </Link>
      </div>
    </AdminLayout>
  );
}