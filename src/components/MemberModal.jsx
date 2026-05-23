import { useState, useEffect } from 'react';
import { toInputDate } from '../utils/helpers';

const PLAN_PRESETS = [
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
];

export default function MemberModal({ member, onClose, onSave }) {
  const isEdit = !!member;
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    planDuration: 30,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || '',
        phone: member.phone || '',
        password: '',
        planDuration: member.planDuration || 30,
        joinDate: toInputDate(member.joinDate),
        status: member.status || 'ACTIVE',
      });
    }
  }, [member]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone || (!isEdit && !form.password)) {
      setError('Name, phone, and password are required.');
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      setError('Phone must be exactly 10 digits');
      return;
    }
    if (form.planDuration < 1) {
      setError('Plan duration must be at least 1 day');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSave(form);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{isEdit ? 'Edit Member' : 'Add New Member'}</div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9XXXXXXXXX" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{isEdit ? 'New Password (leave blank to keep)' : 'Password'}</label>
          <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
        </div>

        <div className="form-group">
          <label className="form-label">Join Date</label>
          <input type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Plan Duration</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {PLAN_PRESETS.map(p => (
              <button
                key={p.days}
                type="button"
                onClick={() => set('planDuration', p.days)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: form.planDuration === p.days ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                  color: form.planDuration === p.days ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: `1px solid ${form.planDuration === p.days ? 'var(--border-light)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={form.planDuration}
            onChange={e => set('planDuration', parseInt(e.target.value))}
            placeholder="Days"
            min={1}
          />
        </div>

        {isEdit && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}
