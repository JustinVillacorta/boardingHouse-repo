import type { TenantDashboardRepository } from '../../domain/repositories/TenantDashboardRepository';
import type { QuickAction } from '../../domain/entities/TenantDashboard';

export class GetQuickActionsUseCase {
  constructor(private tenantDashboardRepository: TenantDashboardRepository) {}

  async execute(): Promise<QuickAction[]> {
    return await this.tenantDashboardRepository.getQuickActions();
  }
}
