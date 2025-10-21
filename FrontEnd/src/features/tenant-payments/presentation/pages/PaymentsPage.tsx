import React from "react";
import PaymentHistoryTable from "../components/PaymentHistoryTable";
import ReceiptModal from "../components/ReceiptModal";
import { usePayments } from "../hooks/usePayments";

const PaymentsPage: React.FC = () => {
  const { 
    payments, 
    loading, 
    error, 
    receipt, 
    isReceiptModalOpen, 
    isDownloading,
    showReceipt, 
    downloadReceipt, 
    closeReceiptModal, 
    refresh 
  } = usePayments();

  if (loading && payments.length === 0) {
    return (
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (error && payments.length === 0) {
    return (
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading payments
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={refresh}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment History Table */}
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">Your payment history will appear here once you make payments.</p>
            </div>
          ) : (
            <PaymentHistoryTable 
              payments={payments} 
              onDownloadReceipt={showReceipt}
            />
          )}

          {/* Receipt Modal */}
          <ReceiptModal
            receipt={receipt}
            isOpen={isReceiptModalOpen}
            onClose={closeReceiptModal}
            onDownload={downloadReceipt}
            isDownloading={isDownloading}
          />
        </div>
    </main>
  );
};

export default PaymentsPage;
