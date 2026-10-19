import axios from 'axios';

const TOKEN_KEY = 'tripease_token';
let activeRequests = 0;

export const getActiveRequestCount = () => activeRequests;

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const publishRequestState = () => {
  window.dispatchEvent(new CustomEvent('api:request-state', {
    detail: { loading: activeRequests > 0 },
  }));
};

const finishRequest = (config) => {
  if (config?.__tripEaseTracked) {
    config.__tripEaseTracked = false;
    activeRequests = Math.max(0, activeRequests - 1);
    publishRequestState();
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.__tripEaseTracked = true;
  activeRequests += 1;
  publishRequestState();

  return config;
});

api.interceptors.response.use(
  (response) => {
    finishRequest(response.config);
    return response;
  },
  (error) => {
    finishRequest(error.config);
    const isLogin = error.config?.url?.includes('/login');
    if (error.response?.status === 401 && !isLogin) {
      clearToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export default api;
