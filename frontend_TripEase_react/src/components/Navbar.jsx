import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">✈ TripEase</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
        {isAdmin && <Link to="/admin/dashboard">Admin</Link>}
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {user && <span className="nav-user">{user.name}</span>}
      </div>
    </nav>
  );
}
