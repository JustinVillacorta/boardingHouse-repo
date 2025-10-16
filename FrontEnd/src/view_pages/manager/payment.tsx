import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import { 
  Search,
  User, 
  LayoutDashboard,
  DoorOpen,
  PhilippinePeso,
  Wrench,
  BellDot,
  LogOut,
  Bell,
  X,
  Download
} from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import apiService from '../../services/apiService';
import CreatePaymentModal from '../../components/CreatePaymentModal';

interface Payment {
  _id: string;
  tenant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  room: {
    _id: string;
    roomNumber: string;
    roomType: string;
    monthlyRent: number;
  };
  amount: number;
  paymentType: string;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paymentDate?: string;
  receiptNumber?: string;
  isLatePayment: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  roomnumber: string;
  assignee: string;
  status: 'Occupied' | 'More Info';
  dueDate: string;
  payment?: Payment;
}

interface PaymentHistory {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentMethod: string;
}

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomNumber: string;
  tenantName: string;
  tenantId: string;
}

interface MarkAsPaidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentDescription: string;
  amount: number;
  dueDate: string;
  onConfirm: () => void;
}

interface DownloadReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    description: string;
    amount: number;
    dueDate: string;
    paidDate: string;
    paymentMethod: string;
  };
  onDownload: () => void;
}


/* -------------------- TOP NAVBAR -------------------- */
const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "Need Better Notifications Design" },
    { id: 2, text: "Make the Website Responsive" },
    { id: 3, text: "Fix Bug of Able to go Back to a Page" },
  ];

  return (
    <header className="bg-blue-50 shadow-sm border-b border-gray-200 px-4 lg:px-6 py-9 relative">
      <div className="flex items-center justify-between h-10">
        {/* Left: Logo/Title */}
        <div
          onClick={() => navigate("/main")}
          className="cursor-pointer flex flex-col items-start ml-5">
          <h1 className="ml-2 text-3xl font-semibold text-gray-800">
            Payment
          </h1>
          <p className="ml-2 text-sm text-gray-400">
            Manage your account and preferences
          </p>
        </div>


        {/* Right */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="pl-10 pr-4 py-2 w-[500px] border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 relative -ml-2"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Notifications
                  </h3>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((note, idx) => (
                    <li
                      key={note.id}
                      className="px-4 py-4 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {note.text}
                      {idx < notifications.length - 1 && (
                        <hr className="mt-4 border-gray-200" />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="p-3 border-t border-gray-200 text-center">
                  <button className="text-blue-600 text-sm font-medium hover:underline">
                    View All
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

/* -------------------- MARK AS PAID DIALOG -------------------- */
const MarkAsPaidDialog: React.FC<MarkAsPaidDialogProps> = ({
  isOpen,
  onClose,
  paymentDescription,
  amount,
  dueDate,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Mark as Paid</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to mark this payment as paid?
          </p>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Description:</span>
              <span className="font-medium">{paymentDescription}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">₱{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium">{dueDate}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------- DOWNLOAD RECEIPT DIALOG -------------------- */
const DownloadReceiptDialog: React.FC<DownloadReceiptDialogProps> = ({
  isOpen,
  onClose,
  paymentData,
  onDownload
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Download Receipt of the Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-5 bg-gray-100 p-3 text-sm font-medium text-gray-700">
              <span>Description</span>
              <span>Amount</span>
              <span>Due Date</span>
              <span>Paid Date</span>
              <span>Payment Method</span>
            </div>
            
            {/* Data Row */}
            <div className="grid grid-cols-5 p-3 text-sm text-gray-800">
              <span>{paymentData.description}</span>
              <span>₱{paymentData.amount.toLocaleString()}</span>
              <span>{paymentData.dueDate}</span>
              <span>{paymentData.paidDate}</span>
              <span>{paymentData.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------- PAYMENT HISTORY MODAL -------------------- */
const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  roomNumber, 
  tenantName,
  tenantId 
}) => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [currentPayments, setCurrentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMarkAsPaidDialogOpen, setIsMarkAsPaidDialogOpen] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Fetch payment data when modal opens
  useEffect(() => {
    if (isOpen && tenantId) {
      fetchPaymentData();
    }
  }, [isOpen, tenantId]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Fetch all payments for this tenant
      const response = await apiService.getPaymentsByTenant(tenantId, {
        sort: 'dueDate',
        order: 'desc',
        limit: 50
      });

      if (response.success) {
        const payments = response.data.payments || [];
        
        // Separate current (pending/overdue) and historical (paid) payments
        const current = payments.filter((p: Payment) => p.status === 'pending' || p.status === 'overdue');
        const historical = payments.filter((p: Payment) => p.status === 'paid');
        
        setCurrentPayments(current);
        
        // Convert to PaymentHistory format
        const historyData: PaymentHistory[] = historical.map((p: Payment) => ({
          id: p._id,
          description: p.description || `${p.paymentType} - ${new Date(p.dueDate).toLocaleDateString()}`,
          amount: p.amount,
          dueDate: new Date(p.dueDate).toLocaleDateString(),
          paidDate: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '',
          status: p.status === 'paid' ? 'Paid' : (p.status === 'overdue' ? 'Overdue' : 'Pending') as 'Paid' | 'Pending' | 'Overdue',
          paymentMethod: p.paymentMethod
        }));
        
        setPaymentHistory(historyData);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return "bg-green-100 text-green-800 border-green-200";
      case 'Pending':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'Overdue':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleMarkAsPaid = (payment: any) => {
    setSelectedPayment(payment);
    setIsMarkAsPaidDialogOpen(true);
  };

  const handleDownload = (payment: any) => {
    setSelectedPayment(payment);
    setIsDownloadDialogOpen(true);
  };

  const confirmMarkAsPaid = async () => {
    try {
      if (selectedPayment && selectedPayment._id) {
        const response = await apiService.markPaymentCompleted(selectedPayment._id);
        if (response.success) {
          // Refresh payment data
          await fetchPaymentData();
          alert('Payment marked as completed successfully!');
        } else {
          alert('Failed to mark payment as completed');
        }
      }
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      alert('Failed to mark payment as completed. Please try again.');
    } finally {
      setIsMarkAsPaidDialogOpen(false);
      setSelectedPayment(null);
    }
  };

  const confirmDownload = async () => {
    try {
      if (selectedPayment && selectedPayment.id) {
        const blob = await apiService.downloadPaymentReceipt(selectedPayment.id);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${selectedPayment.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setIsDownloadDialogOpen(false);
      setSelectedPayment(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Full Page Modal */}
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        {/* Sidebar */}
        <Sidebar />
        
        <div className="min-h-screen pl-64">
          {/* Top Navigation Bar */}
          <header className="bg-blue-50 shadow-sm border-b border-gray-200 px-4 lg:px-6 py-9 relative">
            <div className="flex items-center justify-between h-10">
              {/* Left: Title */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-start ml-5">
                  <h1 className="text-3xl font-semibold text-gray-800">
                    Payment
                  </h1>
                  <p className="text-sm text-gray-400">
                    Manage your account and preferences
                  </p>
                </div>
              </div>

              {/* Right: Search Bar and Notifications */}
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="hidden lg:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for anything..."
                    className="pl-10 pr-4 py-2 w-[500px] border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 text-gray-500 hover:text-gray-700 relative -ml-2">
                    <Bell className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Payment History</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Room {roomNumber} - {tenantName}
                </p>
              </div>
            </div>
          </div>

          {/* Current Payments Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Payments</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading payments...</p>
              </div>
            ) : currentPayments.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-4 font-semibold text-gray-700 border-b p-4 text-center bg-gray-50">
                  <span>Description</span>
                  <span>Amount</span>
                  <span>Due Date</span>
                  <span>Actions</span>
                </div>
                
                {/* Current Payment Rows */}
                <div className="divide-y divide-gray-200">
                  {currentPayments.map((payment) => (
                    <div key={payment._id} className="grid grid-cols-4 items-center p-4 text-gray-800">
                      <span className="text-center">
                        {payment.description || `${payment.paymentType} - ${new Date(payment.dueDate).toLocaleDateString()}`}
                      </span>
                      <span className="text-center font-semibold">₱{payment.amount.toLocaleString()}</span>
                      <span className="text-center">{new Date(payment.dueDate).toLocaleDateString()}</span>
                      <span className="text-center">
                        <button 
                          className={`px-3 py-1 text-white rounded-lg transition-colors text-sm ${
                            payment.status === 'overdue' 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          onClick={() => handleMarkAsPaid(payment)}
                        >
                          {payment.status === 'overdue' ? 'Pay Overdue' : 'Mark as Paid'}
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No current payments found</p>
              </div>
            )}
          </div>

          {/* Payment History Section */}
          <div className="p-6 pb-20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h3>
            {paymentHistory.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-6 font-semibold text-gray-700 border-b p-4 text-center bg-gray-50">
                  <span>Description</span>
                  <span>Amount</span>
                  <span>Due Date</span>
                  <span>Paid Date</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                
                {/* Payment History Rows */}
                <div className="divide-y divide-gray-200">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="grid grid-cols-6 items-center p-4 text-gray-800">
                      <span className="text-center">{payment.description}</span>
                      <span className="text-center font-semibold">₱{payment.amount.toLocaleString()}</span>
                      <span className="text-center">{payment.dueDate}</span>
                      <span className="text-center">{payment.paidDate || '-'}</span>
                      <span className="text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </span>
                      <span className="text-center">
                        {payment.status === 'Paid' && (
                          <button 
                            className="p-1 hover:bg-gray-100 rounded transition-colors" 
                            title="Download"
                            onClick={() => handleDownload(payment)}
                          >
                            <Download className="w-4 h-4 text-gray-600 hover:text-gray-800" />
                          </button>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No payment history found</p>
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 z-10">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mark as Paid Dialog */}
      {selectedPayment && (
        <MarkAsPaidDialog
          isOpen={isMarkAsPaidDialogOpen}
          onClose={() => setIsMarkAsPaidDialogOpen(false)}
          paymentDescription={selectedPayment.description}
          amount={selectedPayment.amount}
          dueDate={selectedPayment.dueDate}
          onConfirm={confirmMarkAsPaid}
        />
      )}

      {/* Download Receipt Dialog */}
      {selectedPayment && (
        <DownloadReceiptDialog
          isOpen={isDownloadDialogOpen}
          onClose={() => setIsDownloadDialogOpen(false)}
          paymentData={selectedPayment}
          onDownload={confirmDownload}
        />
      )}
    </>
  );
};

/* -------------------- SIDEBAR -------------------- */
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      navigate("/sign-in");
    } catch (error) {
      console.error('Logout failed:', error);
      setShowLogoutConfirm(false);
      navigate("/sign-in");
    }
  };

  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/main" },
    { name: "Users", icon: User, path: "/main-projects" },
    { name: "Rooms", icon: DoorOpen, path: "/rooms" },
    { name: "Payment", icon: PhilippinePeso, path: "/work-logs" },
    { name: "Reports", icon: Wrench, path: "/performance" },
    { name: "Notifications", icon: BellDot, path: "/notifications" },
    { name: "Logout", icon: LogOut, action: () => setShowLogoutConfirm(true) },
  ];

  const checkIsActive = (itemPath?: string) =>
    itemPath ? location.pathname === itemPath : false;

  return (
    <>
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50">
        <div className="p-6 border-b border-gray-200">
          {/* Logo + Text */}
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="50"
              viewBox="0 0 98 78"
              fill="none"
            >
              <g mask="url(#mask0)">
                <path
                  d="M70.7867 0H26.5453L0.402677 27.4517L9.65315 26.9134V56.6976L2.61475 57.4153C2.61475 57.4153 -0.803907 57.9535 0.00048206 61.1831C0.804871 63.5156 3.41914 63.5156 3.41914 63.5156L9.65315 62.6185V70.5131L53.6935 77.69L88.2822 70.6926V27.6311L97.7338 26.9134C97.5327 26.734 70.7867 0 70.7867 0ZM61.7374 32.6549L71.39 31.7578V43.0615L61.7374 44.138V32.6549ZM12.8707 68.5395V62.2597L31.975 59.3889C31.975 59.3889 35.1925 59.3889 34.9914 56.1593C34.7903 53.2885 31.1706 53.8268 31.1706 53.8268L12.8707 56.3387V26.0163L32.176 5.74153L53.6935 26.9134V74.9987L12.8707 68.5395ZM61.7374 59.5683V47.9059L71.39 46.8293V58.133L61.7374 59.5683ZM83.2548 56.1593L75.2109 57.4153V46.2911L83.2548 45.2145V56.1593ZM75.412 42.7026V31.5784L83.4559 30.8607V41.8055C83.2548 41.8055 75.412 42.7026 75.412 42.7026ZM41.2254 27.8105C39.0134 25.478 35.9969 24.0426 32.5782 24.0426H31.975C28.5563 24.2221 25.7409 25.8369 23.73 28.1694C21.719 30.5019 20.5124 33.7315 20.5124 37.1405V38.0376C20.7135 41.6261 22.1212 44.8557 24.3333 47.0088C26.5453 49.3412 29.5618 50.7766 32.9804 50.7766H33.5837C37.0024 50.5972 39.8177 48.9824 41.8287 46.6499C43.8397 44.3174 45.0463 41.0878 45.0463 37.6788V36.7817C44.8452 33.3726 43.4375 30.143 41.2254 27.8105ZM39.8177 45.3939C38.209 47.3676 35.7958 48.6236 33.3826 48.6236H32.9804C30.3662 48.6236 27.953 47.547 26.1431 45.5734C24.3333 43.5997 22.9256 40.9084 22.9256 37.8582V37.1405C22.9256 34.0903 23.9311 31.399 25.7409 29.4253C27.3497 27.4517 29.7629 26.1957 32.176 26.1957H32.5782C35.1925 26.1957 37.6057 27.2723 39.4156 29.2459C41.2254 31.2196 42.6331 33.9109 42.6331 36.9611V37.6788C42.6331 40.729 41.6276 43.4203 39.8177 45.3939ZM28.5563 37.6788C28.3552 33.9109 29.7629 30.5019 31.7739 29.2459C28.1541 29.4253 25.3387 33.3726 25.7409 37.8582C25.942 42.5232 29.1596 46.1116 32.7793 45.9322C30.5673 44.8557 28.7574 41.6261 28.5563 37.6788Z"
                  fill="#116DB3"
                />
              </g>
            </svg>

            <span className="text-xl font-semibold text-gray-800">
              BoarderMate
            </span>
          </div>

          {/* User Profile - below logo */}
          <div className="mt-4 flex items-center justify-center mr-12 gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
              {user?.tenant 
                ? `${user.tenant.firstName.charAt(0)}${user.tenant.lastName.charAt(0)}`.toUpperCase()
                : user?.username 
                  ? user.username.charAt(0).toUpperCase() + (user.username.charAt(1) || '').toUpperCase()
                  : 'U'
              }
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 text-center">
                {user?.tenant ? `${user.tenant.firstName} ${user.tenant.lastName}` : user?.username || 'User'}
              </p>
              <div className="flex items-center justify-center gap-1 text-sm text-black-700 bg-gray-300 px-3 py-1 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-shield"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"
                  fill="#c62525ff" />
                </svg>
                <div className="text-s text-medium font-semibold">
                  <span className="capitalize">{user?.role || 'User'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        <nav className="mt-6">
          {navigationItems.map((item) => {
            const active = checkIsActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => (item.action ? item.action() : navigate(item.path!))}
                className={`flex items-center px-6 py-3 w-full text-left transition-colors ${
                  active
                    ? "bg-blue-50 border-r-4 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Payment: React.FC = () => {
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [isCreatePaymentModalOpen, setIsCreatePaymentModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{ roomNumber: string; tenantName: string; tenantId: string } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payments data
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all payments with pending and overdue status
      const response = await apiService.getPayments({
        status: 'pending,overdue',
        sort: 'dueDate',
        order: 'asc',
        limit: 50
      });

      if (response.success) {
        setPayments(response.data.payments || []);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to fetch payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Convert payments to tasks for display
  const tasks: Task[] = payments.map(payment => ({
    id: payment._id,
    roomnumber: payment.room?.roomNumber || 'N/A',
    assignee: payment.tenant ? `${payment.tenant.firstName} ${payment.tenant.lastName}` : 'Unknown',
    status: payment.status === 'paid' ? 'Occupied' : 'More Info',
    dueDate: new Date(payment.dueDate).toLocaleDateString(),
    payment
  }));

  const handleMoreInfoClick = (roomNumber: string, tenantName: string, tenantId: string) => {
    setSelectedRoom({ roomNumber, tenantName, tenantId });
    setIsPaymentHistoryModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPaymentHistoryModalOpen(false);
    setSelectedRoom(null);
  };

  const handleMarkAsPaid = async (payment: Payment) => {
    try {
      const response = await apiService.markPaymentCompleted(payment._id);
      if (response.success) {
        // Refresh the payments list
        await fetchPayments();
        // Show success message
        alert('Payment marked as completed successfully!');
      } else {
        alert('Failed to mark payment as completed');
      }
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      alert('Failed to mark payment as completed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 pl-64">
          <TopNavbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 pl-64">
          <TopNavbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchPayments}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 pl-64">
            <TopNavbar />
            
          {/* ✅ Full width wrapper instead of max-w-7xl */}
          <div className="w-full p-6"> 

            {/* Projects Content */}
            <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-6">
              {/* Header with Create Payment Button */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Payment Management</h2>
                  <p className="text-gray-600">Manage tenant payments and dues</p>
                </div>
                <button
                  onClick={() => setIsCreatePaymentModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Payment
                </button>
              </div>

              <div className="flex items-center justify-between mb-6 w-full">
                {/* ✅ Big Box Wrapper */}
                <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  
                  {/* ✅ Header Row */}
                  <div className="grid grid-cols-4 font-semibold text-gray-700 border-b pb-2 mb-4 text-center">
                    <span>Name</span>
                    <span>Room Number</span>
                    <span>Due Date</span>
                    <span>Actions</span>
                  </div>

                  {/* ✅ Task Rows */}
                  <div className="space-y-2">
                    {tasks.length > 0 ? (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className="grid grid-cols-4 items-center py-2 border-b last:border-b-0 font-semibold text-gray-800"
                        >
                          {/* Name */}
                          <span className="text-center">{task.assignee}</span>

                          {/* Room Number */}
                          <span className="text-center">{task.roomnumber}</span>
                          
                          {/* Due Date */}
                          <span className="text-center">{task.dueDate}</span>

                          {/* Actions */}
                          <span className="text-center">
                            {task.payment?.status === 'pending' ? (
                              <div className="flex justify-center space-x-2">
                                <button 
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                  onClick={() => task.payment && handleMarkAsPaid(task.payment)}
                                >
                                  Mark as Paid
                                </button>
                                <button 
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                  onClick={() => handleMoreInfoClick(task.roomnumber, task.assignee, task.payment?.tenant._id || '')}
                                >
                                  More Info
                                </button>
                              </div>
                            ) : task.payment?.status === 'overdue' ? (
                              <div className="flex justify-center space-x-2">
                                <button 
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                  onClick={() => task.payment && handleMarkAsPaid(task.payment)}
                                >
                                  Pay Overdue
                                </button>
                                <button 
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                  onClick={() => handleMoreInfoClick(task.roomnumber, task.assignee, task.payment?.tenant._id || '')}
                                >
                                  More Info
                                </button>
                              </div>
                            ) : (
                              <button 
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                onClick={() => handleMoreInfoClick(task.roomnumber, task.assignee, task.payment?.tenant._id || '')}
                              >
                                More Info
                              </button>
                            )}
                          </span>

                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-lg mb-2">No pending payments found</p>
                        <p className="text-sm">All payments are up to date or you can create a new payment.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>

          </div>
        </div>

        {/* Payment History Modal */}
        {selectedRoom && (
          <PaymentHistoryModal
            isOpen={isPaymentHistoryModalOpen}
            onClose={handleCloseModal}
            roomNumber={selectedRoom.roomNumber}
            tenantName={selectedRoom.tenantName}
            tenantId={selectedRoom.tenantId}
          />
        )}

        {/* Create Payment Modal */}
        <CreatePaymentModal
          isOpen={isCreatePaymentModalOpen}
          onClose={() => setIsCreatePaymentModalOpen(false)}
          onPaymentCreated={fetchPayments}
        />
      </div>
    );
};

export default Payment;