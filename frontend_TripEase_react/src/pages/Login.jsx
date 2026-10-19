import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import useAuth from '../hooks/useAuth';
import { parseApiError } from '../services/errors';

export default function Login() {
  const { login, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={isAdmin ? '/dashboard' : '/my-dashboard'} replace />;
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const clientErrors = {};
    if (!form.email.trim()) {
      clientErrors.email = 'Email is required.';
    }
    if (!form.password) {
      clientErrors.password = 'Password is required.';
    }
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(form);
      const isAdminUser = user?.role?.toLowerCase() === 'admin';
      const from = location.state?.from?.pathname;
      navigate(from || (isAdminUser ? '/dashboard' : '/my-dashboard'), {
        replace: true,
      });
    } catch (error) {
      const parsed = parseApiError(error);
      setMessage(parsed.message);
      setErrors(parsed.errors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Login</h2>
      {location.state?.message && (
        <div className="alert alert-success">{location.state.message}</div>
      )}
      {message && <div className="alert alert-error">{message}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Button type="submit" loading={submitting}>Login</Button>
      </form>
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
