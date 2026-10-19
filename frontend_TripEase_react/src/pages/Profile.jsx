import useAuth from '../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h2>Profile</h2>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
