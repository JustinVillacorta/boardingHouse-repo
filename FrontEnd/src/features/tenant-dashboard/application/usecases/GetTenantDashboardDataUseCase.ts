import type { TenantDashboardRepository } from '../../domain/repositories/TenantDashboardRepository';
import type { TenantDashboardData } from '../../domain/entities/TenantDashboard';

export class GetTenantDashboardDataUseCase {
  constructor(private tenantDashboardRepository: TenantDashboardRepository) {}

  async execute(): Promise<TenantDashboardData> {
    return await this.tenantDashboardRepository.getDashboardData();
  }
}
