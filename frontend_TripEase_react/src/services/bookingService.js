import api from './api';
import { normalizePage } from './packageService';

export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const unwrap = (response) => response.data?.data ?? response.data;

export const fetchBookings = (params) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );

  return api.get('/bookings', { params: cleanParams }).then(normalizePage);
};

export const fetchBooking = (id) => api.get(`/bookings/${id}`).then(unwrap);
export const createBooking = (payload) => api.post('/bookings', payload).then(unwrap);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`).then(unwrap);

export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status }).then(unwrap);

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : '—';
