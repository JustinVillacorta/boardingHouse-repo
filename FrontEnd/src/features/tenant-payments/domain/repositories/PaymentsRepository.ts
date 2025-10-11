import type { Payment, PaymentReceipt } from '../entities/Payment';

export interface PaymentsRepository {
  getPaymentHistory(): Promise<Payment[]>;
  getPaymentReceipt(paymentId: string): Promise<PaymentReceipt>;
  downloadReceipt(paymentId: string): Promise<Blob>;
}
