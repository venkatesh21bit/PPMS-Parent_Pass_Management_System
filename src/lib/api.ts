import axios, { AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Utility functions for common API calls
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/api/auth/register', userData),
  getCurrentUser: () =>
    api.get('/api/auth/me'),
};

export const visitAPI = {
  createVisit: (visitData: any) =>
    api.post('/api/visits', visitData),
  getVisits: (params?: any) =>
    api.get('/api/visits', { params }),
  getVisitById: (id: string) =>
    api.get(`/api/visits/${id}`),
  approveVisit: (id: string, status: boolean, remarks?: string) =>
    api.post(`/api/visits/${id}/approve`, { status, remarks }),
};

export const scanAPI = {
  scanQR: (qrCode: string, scanType: 'ENTRY' | 'EXIT', location?: string, remarks?: string) =>
    api.post('/api/scan/scan', { qrCode, scanType, location, remarks }),
  verifyQR: (qrCode: string) =>
    api.get(`/api/scan/verify/${qrCode}`),
  getScanLogs: (params?: any) =>
    api.get('/api/scan/logs', { params }),
};

export const studentAPI = {
  getStudents: () =>
    api.get('/api/students'),
  searchStudents: (query: string) =>
    api.get('/api/students/search', { params: { q: query } }),
  createStudent: (studentData: any) =>
    api.post('/api/students', studentData),
  getStudentById: (id: string) =>
    api.get(`/api/students/${id}`),
};
