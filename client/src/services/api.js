const API_BASE = 'http://localhost:5000/api';

/**
 * Universal API request wrapper
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('typespeed_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Authentication
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  developerLogin: (payload) => request('/auth/developer/login', { method: 'POST', body: payload }),
  developerRegister: (payload) => request('/auth/developer/register', { method: 'POST', body: payload }),
  forgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: payload }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: payload }),
  forgotEmail: (payload) => request('/auth/forgot-email', { method: 'POST', body: payload }),

  // User
  getProfile: () => request('/user/profile', { method: 'GET' }),
  updateProfile: (payload) => request('/user/profile', { method: 'PUT', body: payload }),
  getUserStatistics: () => request('/user/statistics', { method: 'GET' }),

  // Typing
  getTypingTexts: (mode = '1min', category = '') => {
    const params = new URLSearchParams();
    if (mode) params.append('mode', mode);
    if (category && category !== 'standard') params.append('category', category);
    return request(`/typing/texts?${params.toString()}`, { method: 'GET' });
  },
  saveTypingResult: (payload) => request('/typing/results', { method: 'POST', body: payload }),

  // Payments
  getPaymentConfig: () => request('/payments/config', { method: 'GET' }),
  submitPayment: (payload) => request('/payments/submit', { method: 'POST', body: payload }),
  getUserPayments: () => request('/payments/history', { method: 'GET' }),
  getPaymentById: (id) => request(`/payments/${id}`, { method: 'GET' }),

  // Developer Admin
  getDeveloperStats: () => request('/developer/stats', { method: 'GET' }),
  getAllPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/developer/payments${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  approvePayment: (id, reviewerNotes = '') =>
    request(`/developer/payments/${id}/approve`, { method: 'POST', body: { reviewerNotes } }),
  rejectPayment: (id, reason = '', notes = '') =>
    request(`/developer/payments/${id}/reject`, { method: 'POST', body: { reason, notes } }),
  processRefund: (id, payload) =>
    request(`/developer/payments/${id}/refund`, { method: 'POST', body: payload }),
  getAllUsers: () => request('/developer/users', { method: 'GET' }),
};
