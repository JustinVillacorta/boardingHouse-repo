import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import TenantSidebar from "./TenantSidebar";
import TenantTopbar from "./TenantTopbar";

const TenantLayout: React.FC = () => {
  const location = useLocation();
  
  // Get page title and subtitle based on current route
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/tenant':
        return {
          title: 'Dashboard',
          subtitle: 'Your room info, payments, and account status'
        };
      case '/tenant/notifications':
        return {
          title: 'Notifications',
          subtitle: 'Stay updated with your account activity'
        };
      case '/tenant/payments':
        return {
          title: 'Payments',
          subtitle: 'Your payment history and upcoming dues'
        };
      case '/tenant/reports':
        return {
          title: 'Reports',
          subtitle: 'Submit and track your complaints and maintenance requests'
        };
      case '/tenant/profile':
        return {
          title: 'Profile',
          subtitle: 'Manage your account and preferences'
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Your room info, payments, and account status'
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen bg-gray-50">
      <TenantSidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-64">
        <TenantTopbar title={title} subtitle={subtitle} />
        <Outlet />
      </div>
    </div>
  );
};

export default TenantLayout;
