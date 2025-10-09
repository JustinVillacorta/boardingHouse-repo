import { useState, useEffect, useCallback } from 'react';
import { ReportsService } from '../../application';
import { ReportsRepositoryImpl } from '../../infrastructure/repositories/ReportsRepositoryImpl';
// @ts-ignore - Using JS apiService with TypeScript
import apiService from '../../../../services/apiService';
import type { 
  Report, 
  CreateReportRequest, 
  ReportFilters, 
  ReportStatistics,
  ReportStatus 
} from '../../domain/entities/Report';

// Create service instance
const reportsRepository = new ReportsRepositoryImpl(apiService);
const reportsService = new ReportsService(reportsRepository);

interface UseReportsState {
  reports: Report[];
  statistics: ReportStatistics | null;
  loading: boolean;
  error: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const useReports = () => {
  const [state, setState] = useState<UseReportsState>({
    reports: [],
    statistics: null,
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const getAllReports = useCallback(async (filters?: ReportFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await reportsService.getAllReports(filters);
      
      setState(prev => ({
        ...prev,
        reports: result.reports,
        pagination: result.pagination,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reports';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

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

  const getReportById = useCallback(async (id: string): Promise<Report | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const report = await reportsService.getReportById(id);
      setLoading(false);
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch report';
      setError(errorMessage);
      setLoading(false);
      return null;
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

  const updateReportStatus = useCallback(async (id: string, status: ReportStatus): Promise<Report | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedReport = await reportsService.updateReportStatus(id, status);
      
      // Update report in the current list
      setState(prev => ({
        ...prev,
        reports: prev.reports.map(report => 
          report.id === id ? updatedReport : report
        ),
        loading: false,
      }));
      
      return updatedReport;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update report status';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  const getReportStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statistics = await reportsService.getReportStatistics();
      
      setState(prev => ({
        ...prev,
        statistics,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch report statistics';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    getAllReports();
    getReportStatistics();
  }, [getAllReports, getReportStatistics]);

  return {
    // State
    reports: state.reports,
    statistics: state.statistics,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    
    // Actions
    getAllReports,
    getMyReports,
    getReportById,
    createReport,
    updateReportStatus,
    getReportStatistics,
    
    // Utilities
    clearError: () => setError(null),
    refresh: () => {
      getAllReports();
      getReportStatistics();
    },
  };
};