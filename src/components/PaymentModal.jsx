import { useState } from 'react';

export default function PaymentModal({ member, onClose, onSave }) {
  const [form, setForm] = useState({
    amount: '',
    method: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError('Enter a valid amount (must be greater than 0)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSave({ ...form, memberId: member.id });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Add Payment</div>
        <div style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
          Recording payment for <strong style={{ color: 'var(--text-primary)' }}>{member.name}</strong>
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input
            type="number"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            placeholder="0"
            min={0}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Method</label>
            <select value={form.method} onChange={e => set('method', e.target.value)}>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" value={form.paymentDate} onChange={e => set('paymentDate', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Add Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
