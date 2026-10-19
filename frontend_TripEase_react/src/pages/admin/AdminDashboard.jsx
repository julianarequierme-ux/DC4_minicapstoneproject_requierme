import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import StatCard from '../../components/StatCard';
import useDashboard from '../../hooks/useDashboard';

export default function AdminDashboard() {
  const { stats, loading, error } = useDashboard();

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <Alert type="error">{error}</Alert>
      {loading && <Spinner />}

      {stats && (
        <div className="stat-grid">
          <StatCard icon="🗺️" label="Travel Packages" value={stats.total_packages} />
          <StatCard icon="🧳" label="Total Bookings" value={stats.total_bookings} />
          <StatCard icon="⏳" label="Pending" value={stats.pending_bookings} tone="amber" />
          <StatCard icon="✅" label="Approved" value={stats.approved_bookings} tone="green" />
          <StatCard icon="🏁" label="Completed" value={stats.completed_bookings} tone="teal" />
          <StatCard icon="👥" label="Customers" value={stats.total_customers} />
        </div>
      )}
    </div>
  );
}
