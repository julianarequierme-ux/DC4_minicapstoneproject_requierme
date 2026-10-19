import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { parseApiError } from '../services/errors';
import { createBooking } from '../services/bookingService';
import { fetchPackage, formatPrice } from '../services/packageService';
import { showToast } from '../services/toasts';
import Spinner from '../components/Spinner';

const localToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export default function BookPackage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    number_of_guests: '1',
    booking_date: '',
    special_request: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    fetchPackage(id)
      .then((travelPackage) => {
        if (active) {
          setResult({ id, travelPackage, error: '' });
        }
      })
      .catch((requestError) => {
        if (active) {
          setResult({
            id,
            travelPackage: null,
            error: requestError.response?.status === 404
              ? 'Package not found.'
              : parseApiError(requestError).message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const isCurrentResult = result?.id === id;
  const travelPackage = isCurrentResult ? result.travelPackage : null;
  const loading = !isCurrentResult;
  const loadError = isCurrentResult ? result.error : '';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const validationErrors = {};
    const guests = Number(form.number_of_guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > 50) {
      validationErrors.number_of_guests = 'Enter between 1 and 50 guests.';
    } else if (travelPackage && guests > Number(travelPackage.availability)) {
      validationErrors.number_of_guests = `Only ${travelPackage.availability} slot(s) available.`;
    }
    if (!form.booking_date) {
      validationErrors.booking_date = 'Choose a travel date.';
    } else if (form.booking_date < localToday()) {
      validationErrors.booking_date = 'Date cannot be in the past.';
    }
    if (form.special_request.length > 500) {
      validationErrors.special_request = 'Maximum 500 characters.';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || !travelPackage) {
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        travel_package_id: travelPackage.id,
        number_of_guests: guests,
        booking_date: form.booking_date,
        special_request: form.special_request || null,
      });
      showToast('success', 'Booking submitted. Status: Pending.');
      navigate('/my-bookings', { state: { message: 'Booking submitted. Status: Pending.' } });
    } catch (requestError) {
      const parsed = parseApiError(requestError);
      setMessage(parsed.message);
      setErrors(parsed.errors);
      showToast('error', parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Link to={`/packages/${id}`}>← Back to package</Link>
      {loading && <Spinner label="Loading package..." />}
      <Alert type="error">{loadError}</Alert>

      {travelPackage && (
        <article className="card detail">
          <h2>Book: {travelPackage.title}</h2>
          <p className="muted">
            {travelPackage.destination} · {formatPrice(travelPackage.price)} per guest
          </p>
          <Alert type="error">{message}</Alert>
          <form onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Number of guests"
              name="number_of_guests"
              type="number"
              value={form.number_of_guests}
              onChange={handleChange}
              error={errors.number_of_guests}
              required
            />
            <FormInput
              label="Travel date"
              name="booking_date"
              type="date"
              value={form.booking_date}
              onChange={handleChange}
              error={errors.booking_date}
              required
            />
            <div className="form-group">
              <label htmlFor="special_request">Special request (optional)</label>
              <textarea
                id="special_request"
                name="special_request"
                rows="3"
                maxLength="500"
                value={form.special_request}
                onChange={handleChange}
                className={errors.special_request ? 'input-error' : ''}
              />
              {errors.special_request && (
                <small className="error-text">
                  {Array.isArray(errors.special_request)
                    ? errors.special_request[0]
                    : errors.special_request}
                </small>
              )}
            </div>
            <p>
              Total: <strong>{formatPrice((Number(travelPackage.price) || 0)
                * (Number(form.number_of_guests) || 0))}</strong>
            </p>
            <Button type="submit" loading={submitting}>Submit booking</Button>
          </form>
        </article>
      )}
    </div>
  );
}
