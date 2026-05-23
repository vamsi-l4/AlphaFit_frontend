import { formatDate, daysUntilExpiry } from '../utils/helpers';

export default function MemberCard({ member, onEdit, onPay, onDelete }) {
    const days = daysUntilExpiry(member.expiryDate);
    const statusClass = member.status.toLowerCase();

    return (
        <div className="member-card card">
            <div className="member-info">
                <h4 className="member-name">{member.name}</h4>
                <p className="member-phone">{member.phone}</p>
                <div className="member-details">
                    <span>Joined: {formatDate(member.joinDate)}</span>
                    <span>Plan: {member.planDuration}d</span>
                    <span>Expires: {formatDate(member.expiryDate)}</span>
                </div>
                <div className="member-status-row">
                    <span className={`days-left ${days <= 3 ? 'urgent' : days <= 7 ? 'warning' : ''}`}>
                        {days > 0 ? `${days}d left` : 'Expired'}
                    </span>
                    <span className={`badge badge-${statusClass}`}>{member.status}</span>
                </div>
            </div>
            <div className="member-actions">
                <button className="btn-ghost btn-sm btn-edit" onClick={() => onEdit(member)}>Edit</button>
                <button className="btn-ghost btn-sm btn-pay" onClick={() => onPay(member)}>Pay</button>
                <button className="btn-danger btn-sm btn-delete" onClick={() => onDelete(member)}>Delete</button>
            </div>
        </div>
    );
}
