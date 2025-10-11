export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Failed';

export interface Payment {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: PaymentStatus;
  method: string | null;
  dueDate: string;
  paidDate: string | null;
  receiptUrl?: string;
}

export interface PaymentReceipt {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate: string;
  paymentMethod: string;
  transactionId?: string;
}
