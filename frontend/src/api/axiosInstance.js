import axios from 'axios';

/**
 * Axios instance pre-configured for the CodeRank API.
 * - Base URL points to the Express backend
 * - Automatically attaches the JWT token from localStorage on every request
 * - Intercepts 401 responses to clear stale tokens
 */
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// ── Request interceptor — attach JWT token if present ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — normalise error shape ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // On 401, wipe the stored token so UI resets to logged-out state
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    // Bubble up the server's error message when available
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default api;
