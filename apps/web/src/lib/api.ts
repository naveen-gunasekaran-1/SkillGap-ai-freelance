import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('skillgap.token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status >= 500) {
      // Placeholder for global toast handling.
      console.error('Server error');
    }
    return Promise.reject(error);
  },
);
