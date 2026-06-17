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
      err?.response?.data?.errors?.[0]?.msg ||
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
export const createSite = (body) => api.post('/sites', body).then((r) => r.data.data);
export const updateSite = (id, body) => api.put(`/sites/${id}`, body).then((r) => r.data.data);
export const deleteSite = (id) => api.delete(`/sites/${id}`).then((r) => r.data);

/* ── Investors ──────────────────────────────────────── */
export const getInvestors = (siteId) =>
  api.get('/investors', { params: siteId ? { siteId } : {} }).then((r) => r.data.data);
export const createInvestor = (body) => api.post('/investors', body).then((r) => r.data.data);
export const updateInvestor = (id, body) => api.put(`/investors/${id}`, body).then((r) => r.data.data);
export const deleteInvestor = (id) => api.delete(`/investors/${id}`).then((r) => r.data);

/* ── Expenses ───────────────────────────────────────── */
export const getExpenses = (params = {}) =>
  api.get('/expenses', { params }).then((r) => r.data.data);
export const createExpense = (body) => api.post('/expenses', body).then((r) => r.data.data);
export const updateExpense = (id, body) => api.put(`/expenses/${id}`, body).then((r) => r.data.data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then((r) => r.data);

/* ── Payments ───────────────────────────────────────── */
export const getPayments = (params = {}) =>
  api.get('/payments', { params }).then((r) => r.data.data);
export const createPayment = (body) => api.post('/payments', body).then((r) => r.data.data);
export const updatePayment = (id, body) => api.put(`/payments/${id}`, body).then((r) => r.data.data);
export const deletePayment = (id) => api.delete(`/payments/${id}`).then((r) => r.data);

/* ── Members (owner/admin only) ─────────────────────────── */
export const getMembers = () => api.get('/auth/members').then(r => r.data.data);
export const addMember = (body) => api.post('/auth/members', body).then(r => r.data.member);
export const deleteMember = (id) => api.delete(`/auth/members/${id}`).then(r => r.data);
export const getStats = () =>
  api.get('/stats').then((r) => r.data).catch(() => null);

/* ── BOQ ────────────────────────────────────────────── */
export const getBOQs = (siteId) =>
  api.get('/boq', { params: siteId ? { siteId } : {} }).then((r) => r.data.data);
export const getBOQ = (id) => api.get(`/boq/${id}`).then((r) => r.data.data);
export const createBOQ = (body) => api.post('/boq', body).then((r) => r.data.data);
export const updateBOQ = (id, body) => api.put(`/boq/${id}`, body).then((r) => r.data.data);
export const deleteBOQ = (id) => api.delete(`/boq/${id}`).then((r) => r.data);
export const updateBOQItemCompletion = (boqId, itemId, completionPct) =>
  api.patch(`/boq/${boqId}/item/${itemId}/completion`, { completionPct }).then((r) => r.data.data);

/* ── Vendors ────────────────────────────────────────── */
export const getVendors = () => api.get('/vendors').then((r) => r.data.data);
export const createVendor = (body) => api.post('/vendors', body).then((r) => r.data.data);
export const updateVendor = (id, body) => api.put(`/vendors/${id}`, body).then((r) => r.data.data);
export const deleteVendor = (id) => api.delete(`/vendors/${id}`).then((r) => r.data);

/* ── GST ────────────────────────────────────────────── */
export const getGSTProfile = () => api.get('/gst/profile').then((r) => r.data.data);
export const updateGSTProfile = (body) => api.put('/gst/profile', body).then((r) => r.data.data);
export const getGSTDashboard = () => api.get('/gst/dashboard').then((r) => r.data.data);
export const getITCExpenses = (params = {}) => api.get('/gst/itc', { params }).then((r) => r.data.data);
export const claimITC = (expenseId) => api.post(`/gst/itc/${expenseId}/claim`).then((r) => r.data.data);
export const unclaimITC = (expenseId) => api.post(`/gst/itc/${expenseId}/unclaim`).then((r) => r.data.data);
export const getOutputGST = () => api.get('/gst/output').then((r) => r.data.data);
export const getGSTReturns = () => api.get('/gst/returns').then((r) => r.data.data);
export const markGSTReturn = (body) => api.post('/gst/returns', body).then((r) => r.data.data);
export const getGSTAlerts = () => api.get('/gst/alerts').then((r) => r.data.data);
export const getGSTSavings = () => api.get('/gst/savings').then((r) => r.data.data);

export default api;
