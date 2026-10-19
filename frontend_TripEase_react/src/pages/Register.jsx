import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import useAuth from '../hooks/useAuth';
import { parseApiError } from '../services/errors';
import { showToast } from '../services/toasts';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const clientErrors = {};
    if (!form.name.trim()) {
      clientErrors.name = 'Name is required.';
    }
    if (!form.email.trim()) {
      clientErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      clientErrors.email = 'Enter a valid email address.';
    }
    if (form.password.length < 8) {
      clientErrors.password = 'Password must be at least 8 characters.';
    }
    if (form.password !== form.password_confirmation) {
      clientErrors.password_confirmation = 'Passwords do not match.';
    }
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      showToast('success', 'Registration successful. Please log in.');
      navigate('/login', {
        state: { message: 'Registration successful. Please log in.' },
      });
    } catch (error) {
      const parsed = parseApiError(error);
      setMessage(parsed.message);
      setErrors(parsed.errors);
      showToast('error', parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      {message && <div className="alert alert-error">{message}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Full name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
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
        <FormInput
          label="Confirm password"
          name="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation}
        />
        <Button type="submit" loading={submitting}>Register</Button>
      </form>
      <p>Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}
