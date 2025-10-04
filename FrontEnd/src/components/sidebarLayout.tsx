import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Clock,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    setShowLogoutConfirm(false);
    navigate("/sign-in");
  };

  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/main" },
    { name: "Project", icon: FolderOpen, path: "/main-projects" },
    { name: "Task", icon: CheckSquare, path: "/tasks" },
    { name: "Work Logs", icon: Clock, path: "/work-logs" },
    { name: "Performance", icon: TrendingUp, path: "/performance" },
    { name: "Settings", icon: Settings, path: "/settings" },
    { name: "Logout", icon: LogOut, action: () => setShowLogoutConfirm(true) },
  ];

  const projectPaths = [
    "/main-projects",
    "/projects",
    "/create-project",
    "/assign-task",
  ];

  const checkIsActive = (itemPath: string | undefined) => {
    if (!itemPath) return false;
    if (itemPath === "/main-projects") {
      return projectPaths.some((p) => location.pathname.startsWith(p));
    }
    return location.pathname === itemPath;
  };

  return (
    <>
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <svg
              width="50"
              height="40"
              viewBox="0 0 98 78"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-hidden="true"
            >
              <path
                d="M70.9664 0.00170898H26.725L0.582364 27.4534L9.83284 26.9151V56.6993L2.79443 57.417C2.79443 57.417 -0.62422 57.9552 0.18017 61.1849C0.984559 63.5173 3.59882 63.5174 3.59882 63.5174L9.83284 62.6202V70.5148L53.8731 77.6917L88.4619 70.6943V27.6328L97.9135 26.9151C97.7124 26.7357 70.9664 0.00170898 70.9664 0.00170898ZM61.917 32.6566L71.5697 31.7595V43.0632L61.917 44.1397V32.6566ZM13.0504 68.5412V62.2614L32.1546 59.3906C32.1546 59.3906 35.3722 59.3906 35.1711 56.161C34.97 53.2903 31.3503 53.8285 31.3503 53.8285L13.0504 56.3404V26.018L32.3557 5.74324L53.8731 26.9151V75.0004L13.0504 68.5412ZM61.917 59.57V47.9076L71.5697 46.831V58.1347L61.917 59.57ZM83.4345 56.161L75.3906 57.417V46.2928L83.4345 45.2162V56.161ZM75.5917 42.7043V31.5801L83.6356 30.8624V41.8072C83.4345 41.8072 75.5917 42.7043 75.5917 42.7043ZM41.4051 27.8122C39.193 25.4797 36.1766 24.0444 32.7579 24.0444H32.1546C28.736 24.2238 25.9206 25.8386 23.9097 28.1711C21.8987 30.5036 20.6921 33.7332 20.6921 37.1422V38.0393C20.8932 41.6278 22.3009 44.8574 24.5129 47.0105C26.725 49.343 29.7415 50.7783 33.1601 50.7783H33.7634C37.1821 50.5989 39.9974 48.9841 42.0084 46.6516C44.0194 44.3191 45.226 41.0895 45.226 37.6805V36.7834C45.0249 33.3743 43.6172 30.1447 41.4051 27.8122ZM39.9974 45.3957C38.3887 47.3693 35.9755 48.6253 33.5623 48.6253H33.1601C30.5459 48.6253 28.1327 47.5487 26.3228 45.5751C24.5129 43.6014 23.1053 40.9101 23.1053 37.8599V37.1422C23.1053 34.092 24.1107 31.4007 25.9206 29.427C27.5294 27.4534 29.9426 26.1974 32.3557 26.1974H32.7579C35.3722 26.1974 37.7854 27.274 39.5952 29.2476C41.4051 31.2213 42.8128 33.9126 42.8128 36.9628V37.6805C42.8128 40.7307 41.8073 43.422 39.9974 45.3957ZM28.736 37.6805C28.5349 33.9126 29.9426 30.5036 31.9535 29.2476C28.3338 29.427 25.5184 33.3743 25.9206 37.8599C26.1217 42.5249 29.3393 46.1133 32.959 45.9339C30.747 44.8574 28.9371 41.6278 28.736 37.6805Z"
                fill="#253ac2ff"
              />
            </svg>
            
          <span className="text-xl font-semibold text-gray-800">
            BoarderMate
          </span>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          {navigationItems.map((item) => {
            const active = checkIsActive(item.path);

            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    navigate(item.path!);
                  }
                }}
                className={`flex items-center px-6 py-3 text-left w-full transition-colors ${
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

      {/* Logout Confirmation Modal */}
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

export default Sidebar;
