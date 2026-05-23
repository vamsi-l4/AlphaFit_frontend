import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import MemberModal from '../../components/MemberModal';
import PaymentModal from '../../components/PaymentModal';
import MemberCard from '../../components/MemberCard';
import api from '../../utils/api';
import { formatDate, daysUntilExpiry } from '../../utils/helpers';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [paymentMember, setPaymentMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchMembers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const { data } = await api.get('/members', { params });
      setMembers(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [search, filterStatus]);

  const handleSaveMember = async (form) => {
    if (editMember) {
      await api.put(`/members/${editMember.id}`, form);
    } else {
      await api.post('/members', form);
    }
    setShowModal(false);
    setEditMember(null);
    fetchMembers();
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/members/${id}`);
      setDeleteConfirm(null);
      fetchMembers();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete member');
    }
  };

  const handlePaymentMember = (m) => setPaymentMember(m);
  const handleEditMember = (m) => { setEditMember(m); setShowModal(true); };
  const handleDeleteMember = (m) => setDeleteConfirm(m);

  const handleSavePayment = async (form) => {
    await api.post('/payments', form);
    setPaymentMember(null);
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-title">Members</div>
          <div className="page-subtitle">{members.length} total members</div>
        </div>
        <button className="btn-primary" onClick={() => { setEditMember(null); setShowModal(true); }}>
          + Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="filters flex gap-3 mb-4">
        <input
          className="flex-1"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="flex-1" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Member Cards List */}
      <div className="members-list">
        {loading ? (
          <div className="card py-10 text-center text-muted">
            <div className="loading">Loading members...</div>
          </div>
        ) : members.length === 0 ? (
          <div className="card py-10 text-center text-muted">
            No members found
          </div>
        ) : (
          members.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              onEdit={handleEditMember}
              onPay={handlePaymentMember}
              onDelete={handleDeleteMember}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <MemberModal
          member={editMember}
          onClose={() => { setShowModal(false); setEditMember(null); }}
          onSave={handleSaveMember}
        />
      )}

      {paymentMember && (
        <PaymentModal
          member={paymentMember}
          onClose={() => setPaymentMember(null)}
          onSave={handleSavePayment}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-title text-red">Delete Member</div>
            <p className="text-secondary mb-6">
              Are you sure you want to delete <strong className="text-primary">{deleteConfirm.name}</strong>? This will also delete all their payment records.
            </p>
            <div className="flex gap-3 justify-end">
              <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
