import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise errors; on 401 clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('sl_token');
      localStorage.removeItem('sl_user');
      window.location.reload();
    }
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Request failed';
    return Promise.reject(new Error(msg));
  }
);

/* ── Auth ──────────────────────────────────────────── */
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password }).then((r) => r.data);

/* ── Sites ─────────────────────────────────────────── */
export const getSites = () => api.get('/sites').then((r) => r.data.data);

/* ── Investors ──────────────────────────────────────── */
export const getInvestors = (siteId) =>
  api.get('/investors', { params: siteId ? { siteId } : {} }).then((r) => r.data.data);

/* ── Expenses ───────────────────────────────────────── */
export const getExpenses = (params = {}) =>
  api.get('/expenses', { params }).then((r) => r.data.data);

export const createExpense = (body) =>
  api.post('/expenses', body).then((r) => r.data.data);

/* ── Payments ───────────────────────────────────────── */
export const getPayments = (params = {}) =>
  api.get('/payments', { params }).then((r) => r.data.data);

/* ── Stats (optional endpoint) ──────────────────────── */
export const getStats = () =>
  api.get('/stats').then((r) => r.data).catch(() => null);

export default api;
