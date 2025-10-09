export interface Tenant {
  _id: string;
  userId?: {
    _id: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  isAvailable?: boolean;
  occupancyRate?: number;
  primaryPhoto?: string | null;
  id?: string;
}

export type ReportStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';
export type ReportType = 'maintenance' | 'complaint' | 'other';

export interface Report {
  _id: string;
  id?: string;
  tenant: Tenant;
  room: Room;
  type: ReportType;
  title: string;
  description: string;
  status: ReportStatus;
  submittedAt: string;
  createdAt?: string;
  updatedAt: string;
  daysSinceSubmission: number;
  __v?: number;
}

export interface CreateReportRequest {
  type: ReportType;
  title: string;
  description: string;
  tenant?: string; // Optional for admin/staff to specify
  room?: string; // Optional for admin/staff to specify
}

export interface UpdateReportStatusRequest {
  status: ReportStatus;
  description?: string; // Optional description update
}

export interface ReportFilters {
  status?: ReportStatus;
  type?: ReportType;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportStatistics {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  maintenance: number;
  complaint: number;
  other: number;
}