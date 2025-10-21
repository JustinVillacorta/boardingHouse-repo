import React, { useState } from "react";
import { Search, Bell } from "lucide-react";

interface TenantTopbarProps {
  title: string;
  subtitle: string;
  unreadNotifications?: number;
}

const TenantTopbar: React.FC<TenantTopbarProps> = ({ 
  title, 
  subtitle, 
  unreadNotifications = 3 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "Payment Due Soon - Your rent payment is due in 3 days" },
    { id: 2, text: "Maintenance Complete - Your faucet repair has been completed" },
    { id: 3, text: "Building Notice - Scheduled maintenance in common areas this weekend" },
  ];

  return (
    <header className="bg-blue-50 shadow-sm border-b border-gray-200 px-4 lg:px-6 py-9 relative">
      <div className="flex items-center justify-between h-10">
        {/* Left: Page Title */}
        <div className="flex flex-col items-start ml-5">
          <div className="flex items-center gap-3">
            <h1 className="ml-2 text-3xl font-semibold text-gray-800">
              {title}
            </h1>
            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              Tenant
            </span>
          </div>
          <p className="ml-2 text-sm text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Right: Search and Notifications */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 w-[300px] border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 relative"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <Bell className="w-6 h-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
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

export default TenantTopbar;
