// Application constants

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const USER_ROLES = {
  PARENT: 'PARENT',
  SECURITY: 'SECURITY',
  HOSTEL_WARDEN: 'HOSTEL_WARDEN',
} as const;

export const VISIT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  INSIDE: 'INSIDE',
  OUT: 'OUT',
} as const;

export const SCAN_TYPES = {
  ENTRY: 'ENTRY',
  EXIT: 'EXIT',
} as const;

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export const ROUTES = {
  HOME: '/',
  PARENT: '/parent',
  SECURITY: '/security',
  AGASTHYA: '/hostel/agasthya',
  VASISHTA: '/hostel/vasishta',
  GAUTAMA: '/hostel/gautama',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

export const HOSTELS = [
  'Agasthya Bhavanam',
  'Vasishta Bhavanam',
  'Gautama Bhavanam',
] as const;

export const COURSES = [
  'Computer Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Electronics Engineering',
  'Information Technology',
  'Biotechnology',
] as const;

export const BRANCHES = {
  'Computer Science': [
    'Software Engineering',
    'Data Science',
    'Artificial Intelligence',
    'Cybersecurity',
    'Web Development',
  ],
  'Mechanical Engineering': [
    'Thermal Engineering',
    'Manufacturing Engineering',
    'Automotive Engineering',
    'Aerospace Engineering',
  ],
  'Electrical Engineering': [
    'Power Systems',
    'Control Systems',
    'Electronics',
    'Communications',
  ],
  'Civil Engineering': [
    'Structural Engineering',
    'Transportation Engineering',
    'Environmental Engineering',
    'Geotechnical Engineering',
  ],
} as const;

export const ACADEMIC_YEARS = [1, 2, 3, 4] as const;
