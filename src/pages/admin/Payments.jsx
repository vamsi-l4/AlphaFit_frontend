import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import PaymentModal from '../../components/PaymentModal';
import api from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';

function PaymentCard({ payment, index, showMember = false }) {
  return (
    <div className="payment-card card">
      <div className="payment-header">
        <span className="text-muted text-sm">#{index + 1}</span>
        <div className="payment-amount text-green font-bold">{formatCurrency(payment.amount)}</div>
      </div>
      {showMember && payment.member && (
        <div className="payment-member">{payment.member.name} ({payment.member.phone})</div>
      )}
      <div className="payment-date">{formatDate(payment.paymentDate)}</div>
      <span className="payment-method badge" style={{
        background: payment.method === 'UPI' ? 'var(--blue-dim)' : 'var(--bg-tertiary)',
        color: payment.method === 'UPI' ? 'var(--blue)' : 'var(--text-secondary)',
      }}>
        {payment.method}
      </span>
    </div>
  );
}

export default function Payments() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentMember, setPaymentMember] = useState(null);

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      let response;

      console.log('Selected Member:', selectedMember);

      if (selectedMember === 'all') {
        response = await api.get('/payments');
      } else {
        response = await api.get(`/payments/${selectedMember}`);
      }

      console.log('Payments Response:', response.data);
      setPayments(response.data.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    api.get('/members').then(r => setMembers(r.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [selectedMember]);

  const handleSavePayment = async (form) => {
    await api.post('/payments', form);
    setPaymentMember(null);
    await fetchPayments();
  };

  const selectedMemberObj = members.find(m => m.id === parseInt(selectedMember));
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-subtitle">View and manage member payments</div>
        </div>
        <button
          className="btn-primary"
          disabled={!selectedMemberObj}
          onClick={() => setPaymentMember(selectedMemberObj)}
        >
          + Add Payment
        </button>
      </div>

      {/* Member Selector */}
      <div className="card payment-selector-card">
        <div className="payment-selector-row">
          <div className="payment-selector-field">
            <label className="form-label">Select Member</label>
            <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
              <option value="all">All members</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
              ))}
            </select>
          </div>
          {selectedMemberObj && (
            <div className="payment-summary">
              <div>
                <div className="form-label">Status</div>
                <span className={`badge badge-${selectedMemberObj.status.toLowerCase()}`}>{selectedMemberObj.status}</span>
              </div>
              <div>
                <div className="form-label">Total Paid</div>
                <div className="text-accent font-display text-2xl font-bold">{formatCurrency(totalPaid)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payments List */}
      <div className="payments-list payments-list-spaced">
        {loadingPayments ? (
          <div className="card py-10 text-center text-muted">
            <div className="loading">Loading payments...</div>
          </div>
        ) : payments.length === 0 ? (
          <div className="card py-10 text-center text-muted">
            No payments recorded
          </div>
        ) : (
          payments.map((p, i) => (
            <PaymentCard key={p.id} payment={p} index={i} showMember={selectedMember === 'all'} />
          ))
        )}
      </div>

      {paymentMember && (
        <PaymentModal
          member={paymentMember}
          onClose={() => setPaymentMember(null)}
          onSave={handleSavePayment}
        />
      )}
    </AdminLayout>
  );
}
