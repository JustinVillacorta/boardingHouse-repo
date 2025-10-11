import type { PaymentsRepository } from '../../domain/repositories/PaymentsRepository';
import type { Payment, PaymentReceipt } from '../../domain/entities/Payment';
import { GetPaymentHistoryUseCase } from '../usecases/GetPaymentHistoryUseCase';
import { GetPaymentReceiptUseCase } from '../usecases/GetPaymentReceiptUseCase';
import { DownloadReceiptUseCase } from '../usecases/DownloadReceiptUseCase';

export class PaymentsService {
  private getPaymentHistoryUseCase: GetPaymentHistoryUseCase;
  private getPaymentReceiptUseCase: GetPaymentReceiptUseCase;
  private downloadReceiptUseCase: DownloadReceiptUseCase;

  constructor(paymentsRepository: PaymentsRepository) {
    this.getPaymentHistoryUseCase = new GetPaymentHistoryUseCase(paymentsRepository);
    this.getPaymentReceiptUseCase = new GetPaymentReceiptUseCase(paymentsRepository);
    this.downloadReceiptUseCase = new DownloadReceiptUseCase(paymentsRepository);
  }

  async getPaymentHistory(): Promise<Payment[]> {
    return await this.getPaymentHistoryUseCase.execute();
  }

  async getPaymentReceipt(paymentId: string): Promise<PaymentReceipt> {
    return await this.getPaymentReceiptUseCase.execute(paymentId);
  }

  async downloadReceipt(paymentId: string): Promise<Blob> {
    return await this.downloadReceiptUseCase.execute(paymentId);
  }
}
