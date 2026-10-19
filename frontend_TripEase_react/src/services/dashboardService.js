import api from './api';

export const fetchDashboard = () =>
  api.get('/dashboard').then((response) => response.data?.data ?? response.data);
