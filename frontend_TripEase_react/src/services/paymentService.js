import api from './api';
import { normalizePage } from './packageService';

export const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Failed'];
export const PAYMENT_METHODS = ['Cash', 'GCash', 'Card', 'Bank Transfer'];

const unwrap = (response) => response.data?.data ?? response.data;

export const fetchPayments = (params) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );

  return api.get('/payments', { params: cleanParams }).then(normalizePage);
};

export const createPayment = (payload) => api.post('/payments', payload).then(unwrap);
export const updatePayment = (id, payload) => api.put(`/payments/${id}`, payload).then(unwrap);
