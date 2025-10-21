import React from "react";
import { X, Download } from "lucide-react";
import type { PaymentReceipt } from "../../domain/entities/Payment";

interface ReceiptModalProps {
  receipt: PaymentReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onDownload,
  isDownloading
}) => {
  if (!isOpen || !receipt) return null;

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Download Receipt of the Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Receipt Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Description</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Due Date</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Paid Date</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Payment Method</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 text-sm text-gray-900">{receipt.description}</td>
                <td className="py-3 text-sm text-gray-900">{formatCurrency(receipt.amount)}</td>
                <td className="py-3 text-sm text-gray-900">{formatDate(receipt.dueDate)}</td>
                <td className="py-3 text-sm text-gray-900">{formatDate(receipt.paidDate)}</td>
                <td className="py-3 text-sm text-gray-900">{receipt.paymentMethod}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Transaction ID */}
        {receipt.transactionId && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Transaction ID:</span> {receipt.transactionId}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Yes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
