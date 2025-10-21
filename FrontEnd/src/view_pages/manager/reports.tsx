import React, { useState, useEffect } from "react";
import { useNavigate, useLocation  } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard,
  DoorOpen,
  PhilippinePeso,
  Wrench,
  BellDot,
  LogOut,
  Bell,
  User,
  CheckCircle, 
  Play, 
  Clock, 
  AlertCircle,
  Calendar,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import { useReports } from "../../features/reports";
import type { ReportStatus } from "../../features/reports/domain/entities/Report";

// ✅ Define allowed status keys - updated to match backend
type StatusKey = "all" | "resolved" | "in-progress" | "pending" | "rejected";

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
            Reports
          </h1>
          <p className="ml-2 text-sm text-gray-400">
            Generate and view reports
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

/* -------------------- STATUS DROPDOWN COMPONENT -------------------- */
interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: ReportStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ 
  currentStatus, 
  onStatusChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { 
      value: 'pending', 
      label: 'Pending', 
      icon: <Clock className="w-4 h-4" />, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverColor: 'hover:bg-orange-100'
    },
    { 
      value: 'in-progress', 
      label: 'In Progress', 
      icon: <Play className="w-4 h-4" />, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100'
    },
    { 
      value: 'resolved', 
      label: 'Resolved', 
      icon: <CheckCircle className="w-4 h-4" />, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100'
    },
    { 
      value: 'rejected', 
      label: 'Rejected', 
      icon: <X className="w-4 h-4" />, 
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverColor: 'hover:bg-red-100'
    }
  ];

  const currentOption = statusOptions.find(option => option.value === currentStatus);

  const handleOptionClick = (status: string) => {
    onStatusChange(status as ReportStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 rounded-lg border-2 transition-all duration-200
          flex items-center justify-between gap-2 min-w-[140px]
          ${currentOption?.bgColor} ${currentOption?.borderColor} ${currentOption?.color}
          hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          transform active:scale-95
        `}
      >
        <div className="flex items-center gap-2">
          {currentOption?.icon}
          <span className="font-semibold text-sm">{currentOption?.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="py-1">
              {statusOptions.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`
                    w-full px-4 py-3 flex items-center gap-3 text-left transition-all duration-200
                    ${option.color} ${option.hoverColor}
                    ${option.value === currentStatus ? `${option.bgColor} font-semibold shadow-sm` : 'hover:bg-gray-50 hover:pl-5'}
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === statusOptions.length - 1 ? 'rounded-b-lg' : ''}
                    hover:shadow-sm
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`p-1 rounded-full ${option.bgColor} ${option.borderColor} border`}>
                    {option.icon}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.value === currentStatus && (
                    <div className="ml-auto">
                      <CheckCircle className="w-4 h-4 opacity-70" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* -------------------- HELPERS -------------------- */
const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "in-progress":
      return <Play className="w-4 h-4 text-blue-500" />;
    case "pending":
      return <Clock className="w-4 h-4 text-orange-500" />;
    case "rejected":
      return <X className="w-4 h-4 text-red-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-orange-100 text-orange-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "in-progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
};

/* -------------------- MAIN REPORT COMPONENT -------------------- */
const Report: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<StatusKey>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use the reports hook from clean architecture
  const { 
    reports, 
    loading, 
    error, 
    clearError,
    updateReportStatus,
    getAllReports
  } = useReports();

  // Load all reports with higher limit for admin, sorted by latest first
  useEffect(() => {
    getAllReports({ 
      limit: 100,
      sortBy: 'submittedAt',
      sortOrder: 'desc'
    });
  }, [getAllReports]);

  // ✅ Status update handler
  const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      // The hook will automatically refresh the data
    } catch (error) {
      console.error('Failed to update report status:', error);
      // You could add a toast notification here
    }
  };

  // Filter reports based on active filter and search term
  const filteredReports = reports.filter((report) => {
    const matchesFilter = activeFilter === "all" || report.status === activeFilter;
    const matchesSearch = searchTerm === "" || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${report.tenant?.firstName} ${report.tenant?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const statusCounts: Record<StatusKey, number> = {
    all: reports.length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    "in-progress": reports.filter((r) => r.status === "in-progress").length,
    pending: reports.filter((r) => r.status === "pending").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  };

  const filters: { key: StatusKey; label: string }[] = [
    { key: "all", label: "All Reports" },
    { key: "resolved", label: "Resolved" },
    { key: "in-progress", label: "In Progress" },
    { key: "pending", label: "Pending" },
    { key: "rejected", label: "Rejected" },
  ];

    return (
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 pl-64">
            <TopNavbar />
            
                {/* Main Content Area */}
                <main className="flex-1 p-6 overflow-auto">

                      {/* Quick Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total Reports</p>
                              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <AlertCircle className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Resolved</p>
                              <p className="text-2xl font-bold text-green-600">{statusCounts.resolved}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">In Progress</p>
                              <p className="text-2xl font-bold text-blue-600">{statusCounts["in-progress"]}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Play className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Pending</p>
                              <p className="text-2xl font-bold text-red-600">{statusCounts.pending}</p>
                            </div>
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-red-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Search and View Controls */}
                      <div className="flex flex-col mb-6">
                        {/* Search Bar */}
                        <div className="flex-1">
                            <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            </div>
                        </div>
                      </div>

                      {/* Status Filter Tabs */}
                      <div className="flex gap-4 mb-6 border-b border-gray-200">
                        {filters.map(filter => (
                          <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                              activeFilter === filter.key
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {filter.label} ({statusCounts[filter.key]})
                          </button>
                        ))}
                      </div>

                      {/* Loading and Error States */}
                      {loading && (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}

                      {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                          <div className="flex justify-between items-center">
                            <span>{error}</span>
                            <button 
                              onClick={clearError}
                              className="text-red-700 hover:text-red-900"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reports List */}
                      <div className="space-y-4">
                        {!loading && filteredReports.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No reports match your search.' : 'No reports found.'}
                          </div>
                        )}
                        
                        {filteredReports.map(report => (
                          <div
                            key={report._id}
                            className={`bg-white rounded-lg shadow-sm border-l-4 border-l-blue-500 p-6 hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {getStatusIcon(report.status)}
                                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                    {getStatusLabel(report.status)}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                                    {report.type}
                                  </span>
                                </div>

                                <p className="text-gray-600 mb-4">{report.description}</p>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>{`${report.tenant?.firstName} ${report.tenant?.lastName}` || 'Unknown User'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(report.submittedAt).toLocaleDateString()}</span>
                                  </div>
                                  {report.updatedAt && report.updatedAt !== report.submittedAt && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>Updated: {new Date(report.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <span>Room: {report.room?.roomNumber}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span>Days: {report.daysSinceSubmission}</span>
                                  </div>
                                </div>

                              </div>

                              <div className="ml-6 text-right">
                                <div className="text-sm text-gray-500 mb-2">Status</div>
                                <StatusDropdown
                                  currentStatus={report.status}
                                  onStatusChange={(newStatus) => handleStatusUpdate(report._id, newStatus)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                </main>
            </div>
        </div>
    );
};

export default Report;