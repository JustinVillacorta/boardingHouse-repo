export interface ReportsByStatus {
  pending: number;
  'in-progress': number;
  resolved: number;
  rejected: number;
}

export interface ReportsByType {
  maintenance: number;
  complaint: number;
  other: number;
}

export interface RecentReport {
  id: string;
  title: string;
  type: string;
  status: string;
  submittedAt: string;
  tenantId: string;
}

export interface MonthlyReportTrend {
  month: string;
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export interface ReportStatistics {
  total: number;
  thisMonth: number;
  byStatus: ReportsByStatus;
  byType: ReportsByType;
  averageResolutionTime: number;
  recentReports: RecentReport[];
  monthlyTrends: MonthlyReportTrend[];
}