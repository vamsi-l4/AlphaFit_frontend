import axios from 'axios';

let configBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auto-fix: If the live Render URL was provided in Vercel but without '/api', append it automatically
if (configBaseUrl && !configBaseUrl.endsWith('/api')) {
  configBaseUrl = configBaseUrl.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: configBaseUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gym_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gym_token');
      localStorage.removeItem('gym_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
