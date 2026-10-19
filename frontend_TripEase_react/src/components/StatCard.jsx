export default function StatCard({ label, value, icon, tone = 'blue' }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </article>
  );
}
