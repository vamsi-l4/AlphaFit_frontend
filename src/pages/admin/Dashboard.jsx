import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import StatCard from '../../components/StatCard';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch all members and payments at the same time
        const [membersRes, paymentsRes] = await Promise.all([
          api.get('/members'),
          api.get('/payments')
        ]);
        
        const members = membersRes.data.data || [];
        const payments = paymentsRes.data.data || [];

        // Calculate business statistics
        const active = members.filter(m => m.status === 'ACTIVE').length;
        const expired = members.filter(m => m.status === 'EXPIRED').length;
        const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

        setStats({ total: members.length, active, expired, revenue });
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
          <StatCard label="Total Revenue" value={formatCurrency(stats.revenue)} color="var(--text-primary)" accent="var(--accent)" />
        </Link>
        <Link to="/admin/members" style={{ textDecoration: 'none' }}>
          <StatCard label="Active Members" value={stats.active} color="var(--green)" accent="var(--green)" />
        </Link>
        <Link to="/admin/members" style={{ textDecoration: 'none' }}>
          <StatCard label="Expired Members" value={stats.expired} color="var(--red)" accent="var(--red)" />
        </Link>
        <Link to="/admin/members" style={{ textDecoration: 'none' }}>
          <StatCard label="Total Members" value={stats.total} color="var(--text-primary)" />
        </Link>
      </div>
    </AdminLayout>
  );
}