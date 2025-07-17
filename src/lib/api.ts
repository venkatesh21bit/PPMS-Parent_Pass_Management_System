import axios, { AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
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
import type { User, VisitRequest, ScanLog, Student } from '@/types';

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: string;
}

interface VisitParams {
  status?: string;
  studentId?: string;
}

interface ScanLogParams {
  date?: string;
  visitRequestId?: string;
}

interface StudentPayload {
  name: string;
  rollNumber: string;
  course: string;
  branch: string;
  year: number;
  hostelName: string;
  roomNumber?: string;
}

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: RegisterPayload) =>
    api.post('/auth/register', userData),
  getCurrentUser: () =>
    api.get('/auth/me'),
};

export const visitAPI = {
  createVisit: (visitData: VisitRequest) =>
    api.post('/visits', visitData),
  getVisits: (params?: VisitParams) =>
    api.get('/visits', { params }),
  getVisitById: (id: string) =>
    api.get(`/visits/${id}`),
  approveVisit: (id: string, status: boolean, remarks?: string) =>
    api.post(`/visits/${id}/approve`, { status, remarks }),
};

export const scanAPI = {
  scanQR: (qrCode: string, scanType: 'ENTRY' | 'EXIT', location?: string, remarks?: string) =>
    api.post('/scan/scan', { qrCode, scanType, location, remarks }),
  recordScan: (qrCode: string, scanType: 'ENTRY' | 'EXIT', location?: string, remarks?: string) =>
    api.post('/scan/record', { qrCode, scanType, location, remarks }),
  verifyQR: (qrCode: string) =>
    api.get(`/scan/verify/${qrCode}`),
  getScanLogs: (params?: ScanLogParams) =>
    api.get('/scan/logs', { params }),
};

export const studentAPI = {
  getStudents: () =>
    api.get('/students'),
  searchStudents: (query: string) =>
    api.get('/students/search', { params: { q: query } }),
  createStudent: (studentData: StudentPayload) =>
    api.post('/students', studentData),
  getStudentById: (id: string) =>
    api.get(`/students/${id}`),
};
