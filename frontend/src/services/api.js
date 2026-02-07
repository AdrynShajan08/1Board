import axios from 'axios';

// Use environment variable if set, otherwise default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth APIs
export const authAPI = {
  getLoginURL: () => api.get('/auth/login-url'),
  createSession: (requestToken) => api.post('/auth/session', { request_token: requestToken }),
  validateSession: () => api.get('/auth/validate'),
  getProfile: () => api.get('/auth/profile')
};

// Portfolio APIs
export const portfolioAPI = {
  getSummary: () => api.get('/portfolio/summary'),
  getHoldings: () => api.get('/portfolio/holdings'),
  getAllocation: () => api.get('/portfolio/allocation'),
  getPerformance: (days = 30) => api.get(`/portfolio/performance?days=${days}`),
  getTopPerformers: (limit = 5) => api.get(`/portfolio/top-performers?limit=${limit}`),
  getBottomPerformers: (limit = 5) => api.get(`/portfolio/bottom-performers?limit=${limit}`)
};

// Sync APIs
export const syncAPI = {
  fetchNow: () => api.post('/sync/fetch-now')
};

export default api;