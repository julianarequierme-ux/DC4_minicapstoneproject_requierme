import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
        <NavLink to="/" end onClick={close}>Home</NavLink>
        {isAuthenticated && !isAdmin && (
          <>
            <NavLink to="/my-dashboard" onClick={close}>Dashboard</NavLink>
            <NavLink to="/packages" onClick={close}>Packages</NavLink>
            <NavLink to="/my-bookings" onClick={close}>My Bookings</NavLink>
            <NavLink to="/profile" onClick={close}>Profile</NavLink>
          </>
        )}
        {isAdmin && (
          <>
            <NavLink to="/dashboard" onClick={close}>Dashboard</NavLink>
            <NavLink to="/admin/packages" onClick={close}>Packages</NavLink>
            <NavLink to="/admin/bookings" onClick={close}>Bookings</NavLink>
            <NavLink to="/admin/payments" onClick={close}>Payments</NavLink>
          </>
        )}
        {!isAuthenticated && (
          <>
            <NavLink to="/login" onClick={close}>Login</NavLink>
            <NavLink to="/register" onClick={close}>Register</NavLink>
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
