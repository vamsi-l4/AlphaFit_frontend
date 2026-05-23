export default function StatCard({ label, value, sub, color = 'var(--text-primary)', accent }) {
  return (
    <div className="stat-card card">
      {accent && <div className="stat-accent" style={{ background: accent }} />}
      <div className="stat-label uppercase text-muted text-xs tracking-wide font-bold mb-2">
        {label}
      </div>
      <div className="stat-value font-display text-4xl font-black" style={{ color }}>
        {value}
      </div>
      {sub && (
        <div className="stat-sub text-muted text-sm mt-2">
          {sub}
        </div>
      )}
    </div>
  );
}
