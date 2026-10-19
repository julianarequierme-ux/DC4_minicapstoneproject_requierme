import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import useBookingList from '../hooks/useBookingList';
import { BOOKING_STATUSES, cancelBooking, formatDate } from '../services/bookingService';
import { parseApiError } from '../services/errors';
import { formatPrice } from '../services/packageService';
import { showToast } from '../services/toasts';

export default function MyBookings() {
  const location = useLocation();
  const list = useBookingList(10);
  const [success, setSuccess] = useState(location.state?.message || '');
  const [error, setError] = useState('');
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!toCancel) {
      return;
    }

    setCancelling(true);
    setError('');
    try {
      await cancelBooking(toCancel.id);
      setToCancel(null);
      setSuccess('Booking cancelled.');
      showToast('success', 'Booking cancelled.');
      list.reload();
    } catch (requestError) {
      setToCancel(null);
      const message = parseApiError(requestError).message;
      setError(message);
      showToast('error', message);
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    { key: 'id', label: '#' },
    {
      key: 'package',
      label: 'Package',
      render: (booking) => booking.travel_package?.title ?? '—',
    },
    {
      key: 'booking_date',
      label: 'Travel date',
      render: (booking) => formatDate(booking.booking_date),
    },
    { key: 'number_of_guests', label: 'Guests' },
    {
      key: 'total_amount',
      label: 'Total',
      render: (booking) => formatPrice(booking.total_amount),
    },
    {
      key: 'status',
      label: 'Status',
      render: (booking) => <StatusBadge status={booking.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (booking) => (
        <div className="row-actions">
          <Link className="btn btn-secondary" to={`/my-bookings/${booking.id}`}>View</Link>
          {booking.status === 'Pending' && (
            <Button variant="danger" onClick={() => setToCancel(booking)}>Cancel</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <div className="toolbar">
        <h2>My Bookings</h2>
        <select value={list.status} onChange={(event) => list.setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status === 'Confirmed' ? 'Approved' : status}
            </option>
          ))}
        </select>
      </div>

      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
      <Alert type="error" onClose={() => setError('')}>{error || list.error}</Alert>

      <DataTable
        columns={columns}
        data={list.items}
        loading={list.loading}
        emptyMessage={(
          <div className="empty-state">
            <p>You have no bookings for this status. Browse packages to book your first trip.</p>
            <Button variant="secondary" onClick={() => list.setStatus('')}>Clear filters</Button>
          </div>
        )}
      />
      <Pagination
        page={list.page}
        lastPage={list.lastPage}
        from={list.from}
        to={list.to}
        total={list.total}
        onChange={list.setPage}
      />

      <Modal
        isOpen={Boolean(toCancel)}
        title="Cancel booking"
        onClose={() => {
          if (!cancelling) {
            setToCancel(null);
          }
        }}
        footer={(
          <>
            <Button
              variant="secondary"
              disabled={cancelling}
              onClick={() => setToCancel(null)}
            >
              Keep booking
            </Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancel}>
              Yes, cancel
            </Button>
          </>
        )}
      >
        Cancel booking #{toCancel?.id} for{' '}
        <strong>{toCancel?.travel_package?.title}</strong>?
      </Modal>
    </div>
  );
}
