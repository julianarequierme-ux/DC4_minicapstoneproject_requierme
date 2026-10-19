export default function StatusBadge({ status }) {
  const normalizedStatus = String(status || '').toLowerCase();
  const isConfirmed = normalizedStatus === 'confirmed';
  const displayStatus = isConfirmed ? 'Approved' : status;
  const badgeStatus = isConfirmed ? 'approved' : normalizedStatus;

  return (
    <span className={`badge badge-${badgeStatus}`}>
      {displayStatus}
    </span>
  );
}
