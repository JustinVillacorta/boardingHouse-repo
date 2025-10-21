export interface PaymentTotal {
  count: number;
  amount: number;
}

export interface PaymentsByStatus {
  paid: PaymentTotal;
  pending: PaymentTotal;
  overdue: PaymentTotal;
}

export interface MonthlyTrend {
  month: string;
  count: number;
  amount: number;
  paid: number;
  pending: number;
  overdue: number;
}

export interface OverduePayment {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface PaymentStatistics {
  total: PaymentTotal;
  thisMonth: PaymentTotal;
  lastMonth: PaymentTotal;
  thisYear: PaymentTotal;
  byStatus: PaymentsByStatus;
  byMethod: Record<string, PaymentTotal>;
  monthlyTrends: MonthlyTrend[];
  overduePayments: OverduePayment[];
}