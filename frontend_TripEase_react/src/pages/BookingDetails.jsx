import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { cancelBooking, fetchBooking, formatDate } from '../services/bookingService';
import { parseApiError } from '../services/errors';
import { formatPrice } from '../services/packageService';

export default function BookingDetails() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;

    fetchBooking(id)
      .then((booking) => {
        if (active) {
          setResult({ id, booking, error: '' });
        }
      })
      .catch((requestError) => {
        if (active) {
          setResult({
            id,
            booking: null,
            error: [403, 404].includes(requestError.response?.status)
              ? 'Booking not found.'
              : parseApiError(requestError).message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const isCurrentResult = result?.id === id;
  const booking = isCurrentResult ? result.booking : null;
  const loading = !isCurrentResult;
  const loadError = isCurrentResult ? result.error : '';

  const handleCancel = async () => {
    setCancelling(true);
    setError('');

    try {
      const updatedBooking = await cancelBooking(id);
      setResult({ id, booking: updatedBooking, error: '' });
      setSuccess('Booking cancelled.');
    } catch (requestError) {
      setError(parseApiError(requestError).message);
    } finally {
      setCancelling(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="container">
      <Link to="/my-bookings">← Back to my bookings</Link>
      {loading && <p className="state-msg">Loading...</p>}
      <Alert type="error">{loadError || error}</Alert>
      <Alert type="success">{success}</Alert>

      {booking && (
        <article className="card detail">
          <div className="card-top">
            <h2>Booking #{booking.id}</h2>
            <StatusBadge status={booking.status} />
          </div>
          <p><strong>Package:</strong> {booking.travel_package?.title}</p>
          <p><strong>Destination:</strong> {booking.travel_package?.destination}</p>
          <p><strong>Travel date:</strong> {formatDate(booking.booking_date)}</p>
          <p><strong>Guests:</strong> {booking.number_of_guests}</p>
          <p><strong>Total:</strong> {formatPrice(booking.total_amount)}</p>
          <p><strong>Special request:</strong> {booking.special_request || 'None'}</p>
          {booking.status === 'Pending' && (
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Cancel booking
            </Button>
          )}
        </article>
      )}

      <Modal
        isOpen={confirmOpen}
        title="Cancel booking"
        onClose={() => {
          if (!cancelling) {
            setConfirmOpen(false);
          }
        }}
        footer={(
          <>
            <Button
              variant="secondary"
              disabled={cancelling}
              onClick={() => setConfirmOpen(false)}
            >
              Keep booking
            </Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancel}>
              Yes, cancel
            </Button>
          </>
        )}
      >
        Cancel booking #{booking?.id}?
      </Modal>
    </div>
  );
}
