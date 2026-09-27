const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

/**
 * Universal API request wrapper with mobile fallback
 */
async function request(endpoint, options = {}) {
  let token = null;
  try {
    token = localStorage.getItem('typespeed_token');
  } catch {
    token = null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body) {
    if (typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    } else {
      config.body = options.body;
    }
  }

  const targetUrl = `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(targetUrl, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    // If mobile testing on LAN (e.g. 192.168.x.x:5173), retry directly to port 5000 if proxy failed
    if (
      typeof window !== 'undefined' &&
      window.location.port === '5173' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      !targetUrl.includes(':5000')
    ) {
      try {
        const directUrl = `http://${window.location.hostname}:5000/api${endpoint}`;
        const retryRes = await fetch(directUrl, config);
        const retryData = await retryRes.json().catch(() => ({}));
        if (!retryRes.ok) {
          throw new Error(retryData.message || `Request failed with status ${retryRes.status}`);
        }
        return retryData;
      } catch {}
    }

    if (
      error.name === 'TypeError' ||
      error.message.includes('fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('network')
    ) {
      throw new Error('Connection to server failed. Please ensure the backend is running and network is connected.');
    }
    throw error;
  }
}

export const api = {
  // Authentication
  register: (payloadOrName, email, password, confirmPassword) => {
    let body;
    if (typeof payloadOrName === 'object' && payloadOrName !== null) {
      body = payloadOrName;
    } else {
      body = {
        name: payloadOrName,
        email,
        password,
        confirmPassword: confirmPassword || password,
      };
    }
    return request('/auth/register', { method: 'POST', body });
  },
  login: (payloadOrEmail, password) => {
    let body;
    if (typeof payloadOrEmail === 'object' && payloadOrEmail !== null) {
      body = payloadOrEmail;
    } else {
      body = { email: payloadOrEmail, password };
    }
    return request('/auth/login', { method: 'POST', body });
  },
  developerLogin: (payloadOrEmail, password) => {
    let body;
    if (typeof payloadOrEmail === 'object' && payloadOrEmail !== null) {
      body = payloadOrEmail;
    } else {
      body = { email: payloadOrEmail, password };
    }
    return request('/auth/developer/login', { method: 'POST', body });
  },
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
  getLeaderboard: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/typing/leaderboard${query ? `?${query}` : ''}`, { method: 'GET' });
  },

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
