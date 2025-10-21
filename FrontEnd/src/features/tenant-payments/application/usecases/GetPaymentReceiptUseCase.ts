import type { PaymentsRepository } from '../../domain/repositories/PaymentsRepository';
import type { PaymentReceipt } from '../../domain/entities/Payment';

export class GetPaymentReceiptUseCase {
  constructor(private paymentsRepository: PaymentsRepository) {}

  async execute(paymentId: string): Promise<PaymentReceipt> {
    return await this.paymentsRepository.getPaymentReceipt(paymentId);
  }
}
