// Global type definitions for the application

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'PARENT' | 'SECURITY' | 'WARDEN';
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  course: string;
  branch: string;
  year: number;
  hostelName: string;
  roomNumber?: string;
}

export interface VisitRequest {
  id: string;
  parentId: string;
  studentId: string;
  vehicleNo?: string;
  purpose?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'INSIDE' | 'OUT';
  qrCode: string;
  validFrom: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  parent?: {
    name: string;
    email: string;
  };
  student?: Student;
  approvals?: Approval[];
  scanLogs?: ScanLog[];
  qrCodeImage?: string;
}

export interface Approval {
  id: string;
  visitRequestId: string;
  wardenId: string;
  status: boolean;
  remarks?: string;
  approvedAt: string;
  warden?: {
    name: string;
    email: string;
  };
}

export interface ScanLog {
  id: string;
  visitRequestId: string;
  scannedBy: string;
  scanType: 'ENTRY' | 'EXIT';
  location?: string;
  timestamp: string;
  remarks?: string;
  createdAt: string;
  scanner?: {
    name: string;
    role: string;
  };
  visitRequest?: VisitRequest;
}

export interface ApiResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'PARENT' | 'SECURITY' | 'WARDEN';
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
