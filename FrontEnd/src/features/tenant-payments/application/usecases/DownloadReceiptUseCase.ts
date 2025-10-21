import type { PaymentsRepository } from '../../domain/repositories/PaymentsRepository';

export class DownloadReceiptUseCase {
  constructor(private paymentsRepository: PaymentsRepository) {}

  async execute(paymentId: string): Promise<Blob> {
    return await this.paymentsRepository.downloadReceipt(paymentId);
  }
}
