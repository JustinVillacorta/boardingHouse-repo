import { useState, useEffect, useCallback } from 'react';
import { ReportsService } from '../../application';
import { ReportsRepositoryImpl } from '../../infrastructure/repositories/ReportsRepositoryImpl';
// @ts-ignore - Using JS apiService with TypeScript
import apiService from '../../../../services/apiService';
import type { 
  Report, 
  CreateReportRequest, 
  ReportFilters,
  ReportStatus 
} from '../../domain/entities/Report';

// Create service instance
const reportsRepository = new ReportsRepositoryImpl(apiService);
const reportsService = new ReportsService(reportsRepository);

interface UseTenantReportsState {
  reports: Report[];
  loading: boolean;
  error: string | null;
}

export const useTenantReports = () => {
  const [state, setState] = useState<UseTenantReportsState>({
    reports: [],
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const getMyReports = useCallback(async (filters?: ReportFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const reports = await reportsService.getMyReports(filters);
      
      setState(prev => ({
        ...prev,
        reports,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch my reports';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (reportData: CreateReportRequest): Promise<Report | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const newReport = await reportsService.createReport(reportData);
      
      // Add new report to the current list
      setState(prev => ({
        ...prev,
        reports: [newReport, ...prev.reports],
        loading: false,
      }));
      
      return newReport;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create report';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  // Load initial data - only get my reports, not all reports
  useEffect(() => {
    getMyReports();
  }, [getMyReports]);

  return {
    // State
    reports: state.reports,
    loading: state.loading,
    error: state.error,
    
    // Actions
    getMyReports,
    createReport,
    refresh: getMyReports,
    clearError: () => setError(null),
  };
};
