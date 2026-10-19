import { useEffect, useState } from 'react';
import Alert from '../../components/Alert';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { fetchBookings, formatDate } from '../../services/bookingService';
import { parseApiError } from '../../services/errors';
import { formatPrice } from '../../services/packageService';
import {
  createPayment,
  fetchPayments,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  updatePayment,
} from '../../services/paymentService';

const EMPTY_FORM = {
  booking_id: '',
  amount: '',
  payment_method: 'Cash',
  payment_status: 'Unpaid',
};

const nowSql = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const firstError = (error) => (Array.isArray(error) ? error[0] : error);

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const [paymentResult, setPaymentResult] = useState(null);
  const [success, setSuccess] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const paymentRequestKey = JSON.stringify([page, reloadKey]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    fetchPayments({ page, per_page: 10 })
      .then((result) => {
        if (active) {
          setPaymentResult({ requestKey: paymentRequestKey, data: result, error: '' });
        }
      })
      .catch((requestError) => {
        if (active) {
          setPaymentResult({
            requestKey: paymentRequestKey,
            data: { items: [], lastPage: 1 },
            error: parseApiError(requestError).message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [page, reloadKey, paymentRequestKey]);

  const hasCurrentPayments = paymentResult?.requestKey === paymentRequestKey;
  const items = hasCurrentPayments ? paymentResult.data.items : [];
  const lastPage = hasCurrentPayments ? paymentResult.data.lastPage : 1;
  const loading = !hasCurrentPayments;
  const error = hasCurrentPayments ? paymentResult.error : '';

  const openCreate = async () => {
    setEditing(null);
    setErrors({});
    setFormMessage('');
    setForm(EMPTY_FORM);
    setBookings([]);
    setBookingsLoading(true);
    setModalOpen(true);

    try {
      const result = await fetchBookings({ status: 'Confirmed', per_page: 50 });
      setBookings(result.items.filter((booking) => !booking.payment));
    } catch (requestError) {
      setFormMessage(parseApiError(requestError).message);
    } finally {
      setBookingsLoading(false);
    }
  };

  const openEdit = (payment) => {
    setEditing(payment);
    setErrors({});
    setFormMessage('');
    setForm({
      booking_id: payment.booking_id,
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_status: payment.payment_status,
    });
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };

    if (name === 'booking_id') {
      const booking = bookings.find((item) => String(item.id) === value);
      if (booking) {
        nextForm.amount = booking.total_amount;
      }
    }

    setForm(nextForm);
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const validationErrors = {};
    if (!editing && !form.booking_id) {
      validationErrors.booking_id = 'Choose a confirmed booking.';
    }
    if (!form.amount || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      validationErrors.amount = 'Amount must be greater than 0.';
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);
    setFormMessage('');

    const payload = {
      amount: Number(form.amount),
      payment_method: form.payment_method,
      payment_status: form.payment_status,
      paid_at: form.payment_status === 'Paid' ? nowSql() : null,
    };

    try {
      if (editing) {
        await updatePayment(editing.id, payload);
      } else {
        await createPayment({ ...payload, booking_id: Number(form.booking_id) });
      }

      setModalOpen(false);
      setSuccess(editing ? 'Payment updated.' : 'Payment recorded.');
      setReloadKey((currentKey) => currentKey + 1);
    } catch (requestError) {
      const parsed = parseApiError(requestError);
      setFormMessage(parsed.message);
      setErrors(parsed.errors);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'id', label: '#' },
    {
      key: 'booking',
      label: 'Booking',
      render: (payment) => `#${payment.booking_id} · ${payment.booking?.user?.name ?? '—'}`,
    },
    { key: 'amount', label: 'Amount', render: (payment) => formatPrice(payment.amount) },
    { key: 'payment_method', label: 'Method' },
    {
      key: 'payment_status',
      label: 'Status',
      render: (payment) => (
        <span className={`badge badge-${String(payment.payment_status || '').toLowerCase()}`}>
          {payment.payment_status}
        </span>
      ),
    },
    { key: 'paid_at', label: 'Paid at', render: (payment) => formatDate(payment.paid_at) },
    {
      key: 'actions',
      label: 'Actions',
      render: (payment) => (
        <Button variant="secondary" onClick={() => openEdit(payment)}>Update</Button>
      ),
    },
  ];

  return (
    <div className="container">
      <div className="toolbar">
        <h2>Manage Payments</h2>
        <Button onClick={openCreate}>+ Record payment</Button>
      </div>

      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
      <Alert type="error">{error}</Alert>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="No payments recorded yet."
      />
      <Pagination
        page={page}
        lastPage={lastPage}
        from={hasCurrentPayments ? paymentResult.data.from : null}
        to={hasCurrentPayments ? paymentResult.data.to : null}
        total={hasCurrentPayments ? paymentResult.data.total : 0}
        onChange={setPage}
      />

      <Modal
        isOpen={modalOpen}
        title={editing ? `Update payment #${editing.id}` : 'Record payment'}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
          }
        }}
      >
        <Alert type="error">{formMessage}</Alert>
        <form onSubmit={handleSave} noValidate>
          {!editing && (
            <div className="form-group">
              <label htmlFor="booking_id">Confirmed booking</label>
              <select
                id="booking_id"
                name="booking_id"
                value={form.booking_id}
                onChange={handleChange}
                disabled={bookingsLoading}
                className={errors.booking_id ? 'input-error' : ''}
              >
                <option value="">
                  {bookingsLoading ? 'Loading bookings...' : 'Select a booking...'}
                </option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    #{booking.id} · {booking.user?.name} · {booking.travel_package?.title}
                    {' · '}{formatPrice(booking.total_amount)}
                  </option>
                ))}
              </select>
              {errors.booking_id && (
                <small className="error-text">{firstError(errors.booking_id)}</small>
              )}
              {!bookingsLoading && bookings.length === 0 && !formMessage && (
                <small className="muted">No confirmed unpaid bookings are available.</small>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="amount">Amount (PHP)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              className={errors.amount ? 'input-error' : ''}
            />
            {errors.amount && <small className="error-text">{firstError(errors.amount)}</small>}
          </div>

          <div className="form-group">
            <label htmlFor="payment_method">Method</label>
            <select
              id="payment_method"
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
              className={errors.payment_method ? 'input-error' : ''}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            {errors.payment_method && (
              <small className="error-text">{firstError(errors.payment_method)}</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="payment_status">Status</label>
            <select
              id="payment_status"
              name="payment_status"
              value={form.payment_status}
              onChange={handleChange}
              className={errors.payment_status ? 'input-error' : ''}
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.payment_status && (
              <small className="error-text">{firstError(errors.payment_status)}</small>
            )}
          </div>

          <div className="row-actions">
            <Button type="submit" loading={saving}>Save</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
