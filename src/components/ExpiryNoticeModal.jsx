export default function ExpiryNoticeModal({ show, title, message, type = 'warning', onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        <div className={`alert alert-${type}`} style={{ marginBottom: 20 }}>
          {message}
        </div>
        <button className="btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
