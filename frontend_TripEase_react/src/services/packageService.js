import api from './api';

export const STATUS_OPTIONS = ['active', 'inactive'];
export const CATEGORY_OPTIONS = [
  'Adventure',
  'Beach',
  'Cultural',
  'Family',
  'Nature',
  'Relaxation',
];

export function normalizePage(response) {
  let body = response.data;
  if (body?.data && !Array.isArray(body.data)) {
    body = body.data;
  }

  const items = Array.isArray(body) ? body : body?.data ?? [];
  const meta = body?.meta ?? body ?? {};

  return {
    items,
    page: meta.current_page ?? 1,
    lastPage: meta.last_page ?? 1,
    from: meta.from ?? null,
    to: meta.to ?? null,
    total: meta.total ?? items.length,
  };
}

const unwrap = (response) => response.data?.data ?? response.data;

export const fetchPackages = (params) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
  return api.get('/packages', { params: cleanParams }).then(normalizePage);
};

export const fetchPackage = (id) => api.get(`/packages/${id}`).then(unwrap);
export const createPackage = (payload) => api.post('/packages', payload).then(unwrap);
export const updatePackage = (id, payload) => api.put(`/packages/${id}`, payload).then(unwrap);
export const deletePackage = (id) => api.delete(`/packages/${id}`);

export const formatPrice = (value) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value) || 0);
