import type { PaymentsRepository } from '../../domain/repositories/PaymentsRepository';
import type { Payment } from '../../domain/entities/Payment';

export class GetPaymentHistoryUseCase {
  constructor(private paymentsRepository: PaymentsRepository) {}

  async execute(): Promise<Payment[]> {
    return await this.paymentsRepository.getPaymentHistory();
  }
}
