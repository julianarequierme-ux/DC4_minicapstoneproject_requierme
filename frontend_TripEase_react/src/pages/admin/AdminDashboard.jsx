import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import StatCard from '../../components/StatCard';
import useDashboard from '../../hooks/useDashboard';
import { formatPrice } from '../../services/packageService';

export default function AdminDashboard() {
  const { stats, loading, error } = useDashboard();

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <Alert type="error">{error}</Alert>
      {loading && <Spinner />}

      {stats && (
        <div className="stat-grid">
          <StatCard icon="🗺️" label="Travel packages" value={stats.total_packages} />
          <StatCard icon="🧳" label="Total bookings" value={stats.total_bookings} />
          <StatCard icon="⏳" label="Pending bookings" value={stats.pending_bookings} tone="amber" />
          <StatCard icon="✅" label="Confirmed bookings" value={stats.confirmed_bookings} tone="green" />
          <StatCard icon="🏁" label="Completed bookings" value={stats.completed_bookings} tone="teal" />
          <StatCard icon="👥" label="Customers" value={stats.total_customers} />
          <StatCard
            icon="💰"
            label="Revenue (paid)"
            value={formatPrice(stats.total_revenue)}
            tone="green"
          />
        </div>
      )}
    </div>
  );
}
