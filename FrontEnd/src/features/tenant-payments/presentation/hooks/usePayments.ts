import { useState, useEffect, useCallback } from 'react';
import { PaymentsService } from '../../application/services/PaymentsService';
import { PaymentsRepositoryImpl } from '../../infrastructure/repositories/PaymentsRepositoryImpl';
import type { Payment, PaymentReceipt } from '../../domain/entities/Payment';

// Create service instance
const paymentsRepository = new PaymentsRepositoryImpl();
const paymentsService = new PaymentsService(paymentsRepository);

interface UsePaymentsState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

export const usePayments = () => {
  const [state, setState] = useState<UsePaymentsState>({
    payments: [],
    loading: false,
    error: null,
  });

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const payments = await paymentsService.getPaymentHistory();
      
      setState(prev => ({
        ...prev,
        payments,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load payment history';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  const showReceipt = useCallback(async (paymentId: string) => {
    try {
      setLoading(true);
      const receiptData = await paymentsService.getPaymentReceipt(paymentId);
      setReceipt(receiptData);
      setIsReceiptModalOpen(true);
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load receipt';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  const downloadReceipt = useCallback(async () => {
    if (!receipt) return;

    try {
      setIsDownloading(true);
      const blob = await paymentsService.downloadReceipt(receipt.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${receipt.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setIsDownloading(false);
      setIsReceiptModalOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download receipt';
      setError(errorMessage);
      setIsDownloading(false);
    }
  }, [receipt]);

  const closeReceiptModal = useCallback(() => {
    setIsReceiptModalOpen(false);
    setReceipt(null);
  }, []);

  // Load initial data
  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return {
    // State
    payments: state.payments,
    loading: state.loading,
    error: state.error,
    receipt,
    isReceiptModalOpen,
    isDownloading,
    
    // Actions
    showReceipt,
    downloadReceipt,
    closeReceiptModal,
    refresh: loadPayments,
    clearError: () => setError(null),
  };
};
