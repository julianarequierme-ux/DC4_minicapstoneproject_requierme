import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { parseApiError } from '../services/errors';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout, authError } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logout();
    } catch (error) {
      setLogoutError(parseApiError(error).message);
    } finally {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">✈ TripEase</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {isAuthenticated && !isAdmin && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/packages">Packages</Link>
            <Link to="/my-bookings">My Bookings</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}
        {isAdmin && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/packages">Packages</Link>
            <Link to="/admin/bookings">Bookings</Link>
            <Link to="/admin/payments">Payments</Link>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {isAuthenticated && (
          <>
            <span className="nav-user">{user?.name}</span>
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
      {(authError || logoutError) && (
        <p className="alert alert-error">{authError || logoutError}</p>
      )}
    </nav>
  );
}
