import type { TenantDashboardRepository } from '../../domain/repositories/TenantDashboardRepository';
import type { TenantDashboardData, QuickAction } from '../../domain/entities/TenantDashboard';
import { GetTenantDashboardDataUseCase } from '../usecases/GetTenantDashboardDataUseCase';
import { GetQuickActionsUseCase } from '../usecases/GetQuickActionsUseCase';

export class TenantDashboardService {
  private getTenantDashboardDataUseCase: GetTenantDashboardDataUseCase;
  private getQuickActionsUseCase: GetQuickActionsUseCase;

  constructor(tenantDashboardRepository: TenantDashboardRepository) {
    this.getTenantDashboardDataUseCase = new GetTenantDashboardDataUseCase(tenantDashboardRepository);
    this.getQuickActionsUseCase = new GetQuickActionsUseCase(tenantDashboardRepository);
  }

  async getDashboardData(): Promise<TenantDashboardData> {
    return await this.getTenantDashboardDataUseCase.execute();
  }

  async getQuickActions(): Promise<QuickAction[]> {
    return await this.getQuickActionsUseCase.execute();
  }
}
