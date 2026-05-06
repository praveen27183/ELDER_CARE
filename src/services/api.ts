import axios, { type AxiosInstance } from 'axios';

// Extend AxiosInstance to include our custom setToken method
interface CustomAxiosInstance extends AxiosInstance {
  setToken: (token: string) => void;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
}) as CustomAxiosInstance;

// Helper to set token for all subsequent requests
api.setToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
