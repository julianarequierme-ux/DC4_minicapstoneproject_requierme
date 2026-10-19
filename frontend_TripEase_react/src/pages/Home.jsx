import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <>
      <section className="hero">
        <h1>Discover your next adventure</h1>
        <p>Browse travel packages across the Philippines and book your trip in minutes.</p>
        <div className="row-actions hero-actions">
          {isAuthenticated ? (
            <Link
              className="btn btn-light"
              to={isAdmin ? '/admin/dashboard' : '/packages'}
            >
              {isAdmin ? 'Go to admin dashboard' : 'Browse packages'}
            </Link>
          ) : (
            <>
              <Link className="btn btn-light" to="/register">Get started</Link>
              <Link className="btn btn-outline" to="/login">Login</Link>
            </>
          )}
        </div>
      </section>

      <div className="container">
        <div className="feature-grid">
          <article className="card">
            <h3>🔎 Easy search</h3>
            <p className="muted">
              Find packages by title or destination and filter by status.
            </p>
          </article>
          <article className="card">
            <h3>🧳 Simple booking</h3>
            <p className="muted">
              Choose your dates and guests, and see your total before you book.
            </p>
          </article>
          <article className="card">
            <h3>✅ Track everything</h3>
            <p className="muted">
              Follow each booking from Pending to Confirmed to Completed.
            </p>
          </article>
        </div>
      </div>
    </>
  );
}
