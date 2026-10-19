import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import useAuth from '../hooks/useAuth';
import useDashboard from '../hooks/useDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, loading, error } = useDashboard();

  return (
    <div className="container">
      <h2>Welcome, {user?.name}!</h2>
      <p className="muted">Here is a summary of your trips.</p>

      <Alert type="error">{error}</Alert>
      {loading && <Spinner />}

      {stats && (
        <div className="stat-grid">
          <StatCard icon="🧳" label="My bookings" value={stats.total_bookings} />
          <StatCard icon="⏳" label="Pending" value={stats.pending_bookings} tone="amber" />
          <StatCard icon="✅" label="Confirmed" value={stats.confirmed_bookings} tone="green" />
          <StatCard icon="🏁" label="Completed" value={stats.completed_bookings} tone="teal" />
        </div>
      )}

      <div className="row-actions dashboard-actions">
        <Link className="btn btn-primary" to="/packages">Browse packages</Link>
        <Link className="btn btn-secondary" to="/my-bookings">My bookings</Link>
      </div>
    </div>
  );
}
