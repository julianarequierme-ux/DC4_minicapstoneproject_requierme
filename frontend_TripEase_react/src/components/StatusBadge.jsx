export default function StatusBadge({ status }) {
  const normalizedStatus = String(status || '').toLowerCase();

  return (
    <span className={`badge badge-${normalizedStatus}`}>{status}</span>
  );
}
