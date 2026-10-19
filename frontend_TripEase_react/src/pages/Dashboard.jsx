import useAuth from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h2>My Dashboard</h2>
      <p>Welcome, {user?.name}.</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
