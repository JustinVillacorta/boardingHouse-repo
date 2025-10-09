// Export dashboard hook for easy importing
export { useDashboard } from './presentation/hooks/useDashboard';

// Export types if needed elsewhere
export type { DashboardStats } from './domain/entities/DashboardStats';
export type { RoomOccupancy } from './domain/entities/RoomOccupancy';
export type { PaymentStatistics } from './domain/entities/PaymentStatistics';
export type { ReportStatistics } from './domain/entities/ReportStatistics';

// Export services if needed for testing or other components
export { DashboardService } from './application/services/DashboardService';
export { createDashboardRepository } from './infrastructure/repositories/DashboardRepositoryImpl';