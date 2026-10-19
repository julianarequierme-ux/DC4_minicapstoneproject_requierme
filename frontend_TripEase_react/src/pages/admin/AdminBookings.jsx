import { useState } from 'react';
import Alert from '../../components/Alert';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import useBookingList from '../../hooks/useBookingList';
import { BOOKING_STATUSES, formatDate, updateBookingStatus } from '../../services/bookingService';
import { formatPrice } from '../../services/packageService';
import { parseApiError } from '../../services/errors';
import { showToast } from '../../services/toasts';

const ACTIONS = {
  Pending: [
    { to: 'Approved', label: 'Approve', variant: 'primary' },
    { to: 'Cancelled', label: 'Reject', variant: 'danger' },
  ],
  Approved: [{ to: 'Completed', label: 'Mark completed', variant: 'primary' }],
};

export default function AdminBookings() {
  const list = useBookingList(10);
  const [viewing, setViewing] = useState(null);
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const applyStatus = async () => {
    if (!pending) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateBookingStatus(pending.booking.id, pending.to);
      const message = `Booking #${pending.booking.id} is now ${pending.to}.`;
      setSuccess(message);
      showToast('success', message);
      setPending(null);
      setViewing(null);
      list.reload();
    } catch (requestError) {
      setPending(null);
      const message = parseApiError(requestError).message;
      setError(message);
      showToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  const actionButtons = (booking) =>
    (ACTIONS[booking.status] || []).map((action) => (
      <Button
        key={action.to}
        variant={action.variant}
        onClick={() => setPending({ booking, ...action })}
      >
        {action.label}
      </Button>
    ));

  const columns = [
    { key: 'id', label: '#' },
    { key: 'customer', label: 'Customer', render: (booking) => booking.user?.name ?? '—' },
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
          <Button variant="secondary" onClick={() => setViewing(booking)}>View</Button>
          {actionButtons(booking)}
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <div className="toolbar">
        <h2>Manage Bookings</h2>
        <select value={list.status} onChange={(event) => list.setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
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
            <p>No bookings found for this status.</p>
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
        isOpen={Boolean(viewing)}
        title={`Booking #${viewing?.id}`}
        onClose={() => setViewing(null)}
        footer={viewing && <div className="row-actions">{actionButtons(viewing)}</div>}
      >
        {viewing && (
          <ul className="detail-list">
            <li><strong>Customer:</strong> {viewing.user?.name} ({viewing.user?.email})</li>
            <li><strong>Package:</strong> {viewing.travel_package?.title}</li>
            <li><strong>Travel date:</strong> {formatDate(viewing.booking_date)}</li>
            <li><strong>Guests:</strong> {viewing.number_of_guests}</li>
            <li><strong>Total:</strong> {formatPrice(viewing.total_amount)}</li>
            <li><strong>Special request:</strong> {viewing.special_request || 'None'}</li>
            <li><strong>Status:</strong> <StatusBadge status={viewing.status} /></li>
          </ul>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(pending)}
        title={pending?.label}
        onClose={() => {
          if (!saving) {
            setPending(null);
          }
        }}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setPending(null)}
            >
              Back
            </Button>
            <Button
              variant={pending?.to === 'Cancelled' ? 'danger' : 'primary'}
              loading={saving}
              onClick={applyStatus}
            >
              Yes, {pending?.label?.toLowerCase()}
            </Button>
          </>
        }
      >
        Change booking #{pending?.booking.id} from <strong>{pending?.booking.status}</strong> to{' '}
        <strong>{pending?.to}</strong>?
      </Modal>
    </div>
  );
}
