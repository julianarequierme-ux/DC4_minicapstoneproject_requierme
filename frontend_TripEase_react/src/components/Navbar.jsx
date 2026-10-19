import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { parseApiError } from '../services/errors';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout, authError } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const close = () => setOpen(false);

  const handleLogout = async () => {
    close();
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
      <Link to="/" className="brand" onClick={close}>✈ TripEase</Link>
      <button
        className="nav-toggle"
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        ☰
      </button>

      <div id="primary-navigation" className={`nav-links${open ? ' open' : ''}`}>
        <Link to="/" onClick={close}>Home</Link>
        {isAuthenticated && !isAdmin && (
          <>
            <Link to="/my-dashboard" onClick={close}>Dashboard</Link>
            <Link to="/packages" onClick={close}>Packages</Link>
            <Link to="/my-bookings" onClick={close}>My Bookings</Link>
            <Link to="/profile" onClick={close}>Profile</Link>
          </>
        )}
        {isAdmin && (
          <>
            <Link to="/dashboard" onClick={close}>Dashboard</Link>
            <Link to="/admin/packages" onClick={close}>Packages</Link>
            <Link to="/admin/bookings" onClick={close}>Bookings</Link>
            <Link to="/admin/payments" onClick={close}>Payments</Link>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Link to="/login" onClick={close}>Login</Link>
            <Link to="/register" onClick={close}>Register</Link>
          </>
        )}
        {isAuthenticated && (
          <>
            <span className="nav-user">{user?.name}</span>
            <button className="nav-logout" type="button" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
      {(authError || logoutError) && (
        <p className="alert alert-error">{authError || logoutError}</p>
      )}
    </nav>
  );
}
