import axios from 'axios';

export const api = axios.create({
  baseURL: '/api' 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mesa_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiMessage(error) {
  return error?.response?.data?.message || 'Operacion no disponible.';
}
