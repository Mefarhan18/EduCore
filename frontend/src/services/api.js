import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

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

// Helper for basic CRUD operations
const createCrudService = (endpoint) => ({
  getAll: () => api.get(endpoint).then(res => res.data),
  getById: (id) => api.get(`${endpoint}/${id}`).then(res => res.data),
  create: (data) => api.post(endpoint, data).then(res => res.data),
  update: (id, data) => api.put(`${endpoint}/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`${endpoint}/${id}`).then(res => res.data),
  getMe: () => api.get(`${endpoint}/me`).then(res => res.data),
});

export const studentsApi = createCrudService('/students');
export const teachersApi = createCrudService('/teachers');
export const classesApi = createCrudService('/classes');
export const subjectsApi = createCrudService('/subjects');
export const attendanceApi = createCrudService('/attendance');
export const resultsApi = createCrudService('/results');
export const feesApi = createCrudService('/fees');
export const usersApi = createCrudService('/users');

export default api;
