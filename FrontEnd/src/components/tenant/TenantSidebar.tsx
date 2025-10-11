import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  LogOut,
  Bell,
  DollarSign,
  Wrench,
  User,
} from "lucide-react";

interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  action?: () => void;
}

const TenantSidebar: React.FC = () => {
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

  const navigationItems: NavigationItem[] = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/tenant" },
    { name: "Notifications", icon: Bell, path: "/tenant/notifications" },
    { name: "Payments", icon: DollarSign, path: "/tenant/payments" },
    { name: "Reports", icon: Wrench, path: "/tenant/reports" },
    { name: "Profile", icon: User, path: "/tenant/profile" },
    { name: "Logout", icon: LogOut, path: "", action: () => setShowLogoutConfirm(true) },
  ];

  const checkIsActive = (itemPath: string) => {
    // Don't highlight logout button
    if (itemPath === "") {
      return false;
    }
    if (itemPath === "/tenant") {
      return location.pathname === "/tenant";
    }
    return location.pathname.startsWith(itemPath);
  };

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
              BoardMate
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
                  <span>Tenant</span>
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
                onClick={() => (item.action ? item.action() : navigate(item.path))}
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

export default TenantSidebar;
