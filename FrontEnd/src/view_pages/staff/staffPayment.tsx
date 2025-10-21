import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
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

interface Task {
  id: string;
  roomnumber: string;
  assignee: string;
  status: 'Occupied' | 'More Info';
  dueDate: string;
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

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    roomnumber: '305',
    assignee: 'Yaoh Ghori',
    status: 'More Info',
    dueDate: '2024-01-15'
  },
  {
    id: '2',
    roomnumber: '273',
    assignee: 'Sarah Wilson',
    status: 'Occupied',
    dueDate: '2024-01-15'
  },
];

// Sample payment history data for each room
const PAYMENT_HISTORY_DATA: { [roomNumber: string]: PaymentHistory[] } = {
  '305': [
    {
      id: '1',
      description: 'Monthly Rent - October 2024',
      amount: 1200.00,
      dueDate: 'Oct 1, 2024',
      paidDate: 'Oct 1, 2024',
      status: 'Paid',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: '2',
      description: 'Utilities - October 2024',
      amount: 150.00,
      dueDate: 'Nov 1, 2024',
      paidDate: 'Nov 1, 2024',
      status: 'Paid',
      paymentMethod: 'Credit Card'
    },
    {
      id: '3',
      description: 'Monthly Rent - November 2024',
      amount: 1200.00,
      dueDate: 'Nov 5, 2024',
      paidDate: 'Nov 5, 2024',
      status: 'Paid',
      paymentMethod: 'Credit Card'
    }
  ],
  '273': [
    {
      id: '4',
      description: 'Monthly Rent - October 2024',
      amount: 1350.00,
      dueDate: 'Oct 1, 2024',
      paidDate: 'Oct 3, 2024',
      status: 'Paid',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: '5',
      description: 'Utilities - October 2024',
      amount: 120.00,
      dueDate: 'Nov 1, 2024',
      paidDate: 'Nov 2, 2024',
      status: 'Paid',
      paymentMethod: 'Cash'
    },
    {
      id: '6',
      description: 'Monthly Rent - November 2024',
      amount: 1350.00,
      dueDate: 'Nov 5, 2024',
      paidDate: '',
      status: 'Pending',
      paymentMethod: ''
    }
  ]
};

/* -------------------- TOP NAVBAR -------------------- */
const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "Payment overdue for Room 101" },
    { id: 2, text: "New payment received" },
    { id: 3, text: "Monthly rent collection due" },
  ];

  return (
    <header className="bg-blue-50 shadow-sm border-b border-gray-200 px-4 lg:px-6 py-9 relative">
      <div className="flex items-center justify-between h-10">
        {/* Left: Logo/Title */}
        <div
          onClick={() => navigate("/staff-dashboard")}
          className="cursor-pointer flex flex-col items-start ml-5">
          <h1 className="ml-2 text-3xl font-semibold text-gray-800">
            Payment
          </h1>
          <p className="ml-2 text-sm text-gray-400">
            Manage tenant payments and billing
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
  tenantName 
}) => {
  const paymentHistory = PAYMENT_HISTORY_DATA[roomNumber] || [];
  const [isMarkAsPaidDialogOpen, setIsMarkAsPaidDialogOpen] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

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

  const confirmMarkAsPaid = () => {
    // Handle marking payment as paid
    console.log('Marking payment as paid:', selectedPayment);
    setIsMarkAsPaidDialogOpen(false);
    setSelectedPayment(null);
  };

  const confirmDownload = () => {
    // Handle download receipt
    console.log('Downloading receipt for:', selectedPayment);
    setIsDownloadDialogOpen(false);
    setSelectedPayment(null);
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
                    Manage tenant payments and billing
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
                <div className="grid grid-cols-4 items-center p-4 text-gray-800">
                  <span className="text-center">Monthly Rent - October 2024</span>
                  <span className="text-center font-semibold">₱2,000</span>
                  <span className="text-center">Oct 1, 2024</span>
                  <span className="text-center">
                    <button 
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      onClick={() => handleMarkAsPaid({
                        description: 'Monthly Rent - October 2024',
                        amount: 2000,
                        dueDate: 'Oct 1, 2024'
                      })}
                    >
                      Mark as Paid
                    </button>
                  </span>
                </div>
                
                <div className="grid grid-cols-4 items-center p-4 text-gray-800">
                  <span className="text-center">Utilities - October 2024</span>
                  <span className="text-center font-semibold">₱200</span>
                  <span className="text-center">Nov 1, 2024</span>
                  <span className="text-center">
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm cursor-not-allowed">
                      Paid
                    </button>
                  </span>
                </div>
                
                <div className="grid grid-cols-4 items-center p-4 text-gray-800">
                  <span className="text-center">Monthly Rent - November 2024</span>
                  <span className="text-center font-semibold">₱2,000</span>
                  <span className="text-center">Nov 5, 2024</span>
                  <span className="text-center">
                    <button 
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      onClick={() => handleMarkAsPaid({
                        description: 'Monthly Rent - November 2024',
                        amount: 2000,
                        dueDate: 'Nov 5, 2024'
                      })}
                    >
                      Mark as Paid
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History Section */}
          <div className="p-6 pb-20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h3>
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
                      <button 
                        className="p-1 hover:bg-gray-100 rounded transition-colors" 
                        title="Download"
                        onClick={() => handleDownload({
                          description: payment.description,
                          amount: payment.amount,
                          dueDate: payment.dueDate,
                          paidDate: payment.paidDate || 'Oct 1, 2024',
                          paymentMethod: payment.paymentMethod
                        })}
                      >
                        <Download className="w-4 h-4 text-gray-600 hover:text-gray-800" />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
      navigate("/sign-in", { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutConfirm(false);
      navigate("/sign-in", { replace: true });
    }
  };

  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/staff-dashboard" },
    { name: "Users", icon: User, path: "/staff-users" },
    { name: "Rooms", icon: DoorOpen, path: "/staff-rooms" },
    { name: "Payment", icon: PhilippinePeso, path: "/staff-payment" },
    { name: "Reports", icon: Wrench, path: "/staff-reports" },
    { name: "Notifications", icon: BellDot, path: "/staff-notifications" },
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
              {user?.username ? user.username.charAt(0).toUpperCase() + (user.username.charAt(1) || '').toUpperCase() : 'U'}
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
                  <span>Staff</span>
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

const StaffPayment: React.FC = () => {
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{ roomNumber: string; tenantName: string } | null>(null);

  const handleMoreInfoClick = (roomNumber: string, tenantName: string) => {
    setSelectedRoom({ roomNumber, tenantName });
    setIsPaymentHistoryModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPaymentHistoryModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-64">
        <TopNavbar />
        
        {/* ✅ Full width wrapper instead of max-w-7xl */}
        <div className="w-full p-6"> 

          {/* Projects Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-6">
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
                  {SAMPLE_TASKS.map((task) => (
                    <div
                      key={task.id}
                      className="grid grid-cols-4 items-center py-2 border-b last:border-b-0 font-semibold text-gray-800"
                    >
                      {/* Name */}
                      <span className="text-center">{task.assignee}</span>

                      {/* Room Number */}
                      <span className="text-center">{task.roomnumber}</span>
                      
                      {/* Time Started */}
                      <span className="text-center">{task.dueDate}</span>

                      {/* Actions */}
                      <span className="text-center">
                        <button 
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          onClick={() => handleMoreInfoClick(task.roomnumber, task.assignee)}
                        >
                          More Info
                        </button>
                      </span>

                    </div>
                  ))}
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
        />
      )}
    </div>
  );
};

export default StaffPayment;