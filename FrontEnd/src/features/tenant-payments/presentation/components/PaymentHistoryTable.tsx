import React from "react";
import { Download } from "lucide-react";
import type { Payment } from "../../domain/entities/Payment";

interface PaymentHistoryTableProps {
  payments: Payment[];
  onDownloadReceipt: (paymentId: string) => void;
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ 
  payments, 
  onDownloadReceipt 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Failed':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
        <p className="text-sm text-gray-600 mt-1">Track your rent payments and download receipts</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Method
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Receipt
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {payments.map((payment, index) => (
              <tr key={payment.id} className={`transition-all duration-200 hover:bg-blue-50/30 hover:shadow-sm ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              }`}>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(payment.date)}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-700">
                    {payment.method || (
                      <span className="text-gray-400 italic">Not specified</span>
                    )}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  {payment.status === 'Paid' ? (
                    <button
                      onClick={() => onDownloadReceipt(payment.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">Not available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistoryTable;
