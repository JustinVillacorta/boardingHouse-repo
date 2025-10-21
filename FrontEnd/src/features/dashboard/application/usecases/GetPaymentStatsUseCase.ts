import type { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import type { PaymentStatistics } from '../../domain/entities/PaymentStatistics';

export class GetPaymentStatsUseCase {
  constructor(private dashboardRepository: DashboardRepository) {}

  async execute(): Promise<PaymentStatistics> {
    return await this.dashboardRepository.getPaymentStatistics();
  }
}