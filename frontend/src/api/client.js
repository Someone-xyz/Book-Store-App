import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:1010/api/v1',
  withCredentials: true, // sends the httpOnly auth cookie
});

export const errMsg = (err) =>
  err?.response?.data?.message || (err?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running?' : err?.message) || 'Something went wrong';

export const money = (amount, currency = 'usd') =>
  amount === 0 ? 'Free' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export default api;
