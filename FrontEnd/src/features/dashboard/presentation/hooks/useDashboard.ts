import { useState, useEffect } from 'react';
import type { DashboardStats } from '../../domain/entities/DashboardStats';
import type { RoomOccupancy } from '../../domain/entities/RoomOccupancy';
import type { PaymentStatistics } from '../../domain/entities/PaymentStatistics';
import type { ReportStatistics } from '../../domain/entities/ReportStatistics';

import { DashboardService } from '../../application/services/DashboardService';
import { createDashboardRepository } from '../../infrastructure/repositories/DashboardRepositoryImpl';

// Import the existing API service
import ApiService from '../../../../services/apiService';

interface DashboardData {
  stats: DashboardStats | null;
  occupancy: RoomOccupancy | null;
  payments: PaymentStatistics | null;
  reports: ReportStatistics | null;
}

interface UseDashboardReturn {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    occupancy: null,
    payments: null,
    reports: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create service instance
  const dashboardRepository = createDashboardRepository(ApiService);
  const dashboardService = new DashboardService(dashboardRepository);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardData = await dashboardService.getAllDashboardData();
      
      setData({
        stats: dashboardData.stats,
        occupancy: dashboardData.occupancy,
        payments: dashboardData.payments,
        reports: dashboardData.reports,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    loading,
    error,
    refreshData,
  };
};