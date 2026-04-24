import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const workflowsApi = {
  generateAgents: (prompt: string) =>
    api.post('/workflows/generate-agents', { prompt }),
  create: (data: { name: string; description?: string; configuration: unknown }) =>
    api.post('/workflows', data),
  getAll: () => api.get('/workflows'),
  getOne: (id: string) => api.get(`/workflows/${id}`),
  delete: (id: string) => api.delete(`/workflows/${id}`),
};

export const executionsApi = {
  start: (workflowId: string) =>
    api.post(`/executions/workflow/${workflowId}`),
  getAll: () => api.get('/executions'),
  getOne: (id: string) => api.get(`/executions/${id}`),
  getLogs: (id: string) => api.get(`/executions/${id}/logs`),
};

export default api;
