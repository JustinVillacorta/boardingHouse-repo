import type { PaymentsRepository } from '../../domain/repositories/PaymentsRepository';
import type { Payment, PaymentReceipt } from '../../domain/entities/Payment';

export class PaymentsRepositoryImpl implements PaymentsRepository {
  async getPaymentHistory(): Promise<Payment[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
      {
        id: "1",
        date: "2024-01-01",
        description: "Monthly Rent - October 2024",
        amount: 3450,
        status: "Paid",
        method: "Bank Transfer",
        dueDate: "Oct 1, 2024",
        paidDate: "Oct 1, 2024",
        receiptUrl: "/receipts/oct-2024.pdf"
      },
      {
        id: "2",
        date: "2024-02-01",
        description: "Monthly Rent - November 2024",
        amount: 3450,
        status: "Pending",
        method: null,
        dueDate: "Nov 1, 2024",
        paidDate: null
      },
      {
        id: "3",
        date: "2024-03-01",
        description: "Monthly Rent - December 2024",
        amount: 3450,
        status: "Paid",
        method: "Credit Card",
        dueDate: "Dec 1, 2024",
        paidDate: "Dec 1, 2024",
        receiptUrl: "/receipts/dec-2024.pdf"
      },
      {
        id: "4",
        date: "2024-04-01",
        description: "Monthly Rent - January 2025",
        amount: 3450,
        status: "Overdue",
        method: null,
        dueDate: "Jan 1, 2025",
        paidDate: null
      }
    ];
  }

  async getPaymentReceipt(paymentId: string): Promise<PaymentReceipt> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock receipt data based on payment ID
    const receipts: Record<string, PaymentReceipt> = {
      "1": {
        id: "1",
        description: "Monthly Rent - October 2024",
        amount: 3450,
        dueDate: "Oct 1, 2024",
        paidDate: "Oct 1, 2024",
        paymentMethod: "Bank Transfer",
        transactionId: "TXN-2024-001"
      },
      "3": {
        id: "3",
        description: "Monthly Rent - December 2024",
        amount: 3450,
        dueDate: "Dec 1, 2024",
        paidDate: "Dec 1, 2024",
        paymentMethod: "Credit Card",
        transactionId: "TXN-2024-003"
      }
    };

    const receipt = receipts[paymentId];
    if (!receipt) {
      throw new Error('Receipt not found');
    }

    return receipt;
  }

  async downloadReceipt(paymentId: string): Promise<Blob> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock PDF blob
    const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Payment Receipt for Payment ID: ${paymentId}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

    return new Blob([mockPdfContent], { type: 'application/pdf' });
  }
}
