import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import ExpiryNoticeModal from '../../components/ExpiryNoticeModal';

function InfoRow({ label, value, tone }) {
  return (
    <div className="info-row">
      <span className="info-row-label">{label}</span>
      <span className={`info-row-value ${tone ? `text-${tone}` : ''}`}>
        {value}
      </span>
    </div>
  );
}

export default function MemberProfile() {
  const [profile, setProfile] = useState(null);
  const [expiryNotice, setExpiryNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/membership/expiry-check')
      .then((r) => {
        const data = r.data.data;
        setProfile(data);
        if (data.alert) {
          setExpiryNotice(data.alert);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
        <div className="member-profile-loading">
          <span className="loading text-muted">Loading...</span>
        </div>
    );
  }

  const days = profile ? profile.daysLeft : 0;

  return (
    <>
      <ExpiryNoticeModal
        show={!!expiryNotice}
        title={profile?.status === 'EXPIRED' ? 'Membership Expired' : 'Membership Notice'}
        message={expiryNotice || ''}
        type={profile?.status === 'EXPIRED' ? 'danger' : 'warning'}
        onClose={() => setExpiryNotice(null)}
      />

      <div className="member-profile-content">
        {profile?.status === 'EXPIRED' && (
          <div className="alert alert-danger member-profile-alert">
            Your membership has expired. Please contact the gym to renew.
          </div>
        )}
        {days > 0 && days <= 3 && profile?.status === 'ACTIVE' && (
          <div className="alert alert-warning member-profile-alert">
            Your membership expires in <strong>{days} day{days > 1 ? 's' : ''}</strong>. Renew soon.
          </div>
        )}

        <div className="card member-profile-card">
          <div className="member-profile-head">
            <div>
              <div className="member-profile-name">{profile?.name}</div>
              <div className="member-profile-phone">{profile?.phone}</div>
            </div>
            <span className={`badge badge-${profile?.status?.toLowerCase()}`}>{profile?.status}</span>
          </div>

          <InfoRow label="Member Since" value={formatDate(profile?.joinDate)} />
          <InfoRow label="Plan Duration" value={`${profile?.planDuration} Days`} />
          <InfoRow label="Expiry Date" value={formatDate(profile?.expiryDate)} tone={days <= 3 ? 'red' : null} />
          <InfoRow
            label="Days Remaining"
            value={days > 0 ? `${days} days` : 'Expired'}
            tone={days <= 0 ? 'red' : days <= 7 ? 'orange' : 'green'}
          />
        </div>

        <div className="card">
          <div className="member-profile-section-title">Payment History</div>
          {profile?.payments?.length === 0 ? (
            <div className="empty-state">No payments found</div>
          ) : (
            <div className="table-wrap member-profile-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {profile?.payments?.map((p, i) => (
                    <tr key={p.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td>{formatDate(p.paymentDate)}</td>
                      <td className="payment-history-amount">{formatCurrency(p.amount)}</td>
                      <td>
                        <span className={`badge payment-method-${p.method.toLowerCase()}`}>
                          {p.method}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
