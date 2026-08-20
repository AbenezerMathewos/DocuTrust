import axios from 'axios';

// Get API base URL dynamically to allow testing from mobile devices on local network
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    // We will get token from localStorage for now, since it's the easiest in Next.js client side.
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
