import { useState, useEffect, useCallback } from 'react';
import { TenantDashboardService } from '../../application/services/TenantDashboardService';
import { TenantDashboardRepositoryImpl } from '../../infrastructure/repositories/TenantDashboardRepositoryImpl';
import type { TenantDashboardData, QuickAction } from '../../domain/entities/TenantDashboard';

// Create service instance
const tenantDashboardRepository = new TenantDashboardRepositoryImpl();
const tenantDashboardService = new TenantDashboardService(tenantDashboardRepository);

interface UseTenantDashboardState {
  dashboardData: TenantDashboardData | null;
  quickActions: QuickAction[];
  loading: boolean;
  error: string | null;
}

export const useTenantDashboard = () => {
  const [state, setState] = useState<UseTenantDashboardState>({
    dashboardData: null,
    quickActions: [],
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dashboardData, quickActions] = await Promise.all([
        tenantDashboardService.getDashboardData(),
        tenantDashboardService.getQuickActions()
      ]);
      
      setState(prev => ({
        ...prev,
        dashboardData,
        quickActions,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    // State
    dashboardData: state.dashboardData,
    quickActions: state.quickActions,
    loading: state.loading,
    error: state.error,
    
    // Actions
    refresh: loadDashboardData,
    clearError: () => setError(null),
  };
};
