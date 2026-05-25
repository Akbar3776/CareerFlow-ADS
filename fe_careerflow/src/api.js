import axios from 'axios';

// Set the base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001', // fallback to localhost
  withCredentials: true, // if you need to send cookies (optional)
});

// Example of adding an interceptor (optional)
// api.interceptors.request.use(config => {
//   // You can add headers or tokens here
//   return config;
// });

export default api;