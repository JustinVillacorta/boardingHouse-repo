import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  Bell,
  House,
  Dot,
  Clock,
  TrendingUp,
  LayoutDashboard,
  LogOut,
  User,
  Users,
  DoorOpen,
  PhilippinePeso,
  Wrench,
  BellDot
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
            Dashboard
          </h1>
          <p className="ml-2 text-sm text-gray-400">
            Your room info, payments Account status
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
      navigate("/sign-in", { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state and redirect
      setShowLogoutConfirm(false);
      navigate("/sign-in", { replace: true });
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
                  <span>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</span>
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

/* -------------------- DASHBOARD -------------------- */
const workLogData = [
  { name: "Occupied", value: 18, color: "#899effff" },
  { name: "Vacant", value: 2, color: "#ff7575ff" }
];
/* -------------------- PERFORMANCE DATA -------------------- */
type PaymentData = {
  month: string;
  collected: number;
  overdue: number;
};

const SAMPLE_PAYMENTS: PaymentData[] = [
  { month: "Jan", collected: 13500, overdue: 500 },
  { month: "Feb", collected: 13200, overdue: 700 },
  { month: "Mar", collected: 13800, overdue: 600 },
  { month: "Apr", collected: 13000, overdue: 900 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-64">
        <TopNavbar />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Top row with text + icon */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <House className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-medium font-medium text-gray-500">Total Rooms</p>
                    <p className="text-2xl font-semibold text-gray-900">20</p>
                  </div>
                </div>

                {/* Dots below */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center">
                    <Dot />
                    <span className="text-medium font-semibold text-gray-700">18 Occupied</span>
                    <Dot/>
                    <span className="text-medium font-semibold text-gray-700">2 Vacant</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                          <p className="text-2xl font-semibold text-gray-900">18</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-600" />
                      </div>
                  </div>

                  {/* Dots below */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center">
                    <Dot />
                     <span className="text-medium font-semibold text-gray-700">Active Tenancies</span>
                  </div> 
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                          <p className="text-2xl font-semibold text-gray-900">4</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                  </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center">
                    <Dot />
                     <span className="text-medium font-semibold text-gray-700">82.0% Collected</span>
                  </div> 
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-sm font-medium text-gray-500">Maintenance Request</p>
                          <p className="text-2xl font-semibold text-gray-900">3</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                  </div>

                  
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center">
                    <Dot />
                     <span className="text-medium font-semibold text-gray-700">Total Open Request</span>
                  </div> 
                </div>

              </div>
          </div>

          {/* Row 1: Work Log + Performance */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Work Log Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Occupancy Rate</h2>
                <label htmlFor="performance-timeframe" className="sr-only">Select Timeframe</label>
              </div>

              {/* Flex container for Pie + Legend */}
              <div className="flex items-center justify-center">
                {/* Pie Chart */}
                <div className="h-64 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workLogData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                      >
                        {workLogData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Product List */}
                <div className="ml-6 space-y-3">
                  {workLogData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between w-32">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-800">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Performance Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Monthly Payment Trends</h2>
                <span className="text-sm text-gray-600">82.0%</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Payment collection performance over time</p>

              {/* Line Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SAMPLE_PAYMENTS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="collected"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", r: 3 }}
                      name="Collected"
                    />
                    <Line
                      type="monotone"
                      dataKey="overdue"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{ fill: "#EF4444", r: 3 }}
                      name="Overdue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Summary */}
              <div className="flex justify-center gap-6 mt-6">
                <div className="px-6 py-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-blue-600 font-semibold">₱ 12,505</p>
                  <p className="text-sm text-gray-600">Collected</p>
                </div>
                <div className="px-6 py-3 bg-red-50 rounded-lg text-center">
                  <p className="text-red-600 font-semibold">₱ 945</p>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;