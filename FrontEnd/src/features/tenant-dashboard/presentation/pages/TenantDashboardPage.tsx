import React from "react";
import { House, DollarSign, Calendar, CheckCircle } from "lucide-react";
import DashboardStatsCard from "../components/DashboardStatsCard";
import QuickActionButton from "../components/QuickActionButton";
import RecentActivityItem from "../components/RecentActivityItem";
import { useTenantDashboard } from "../hooks/useTenantDashboard";

const TenantDashboardPage: React.FC = () => {
  const { dashboardData, quickActions, loading, error, refresh } = useTenantDashboard();

  if (loading) {
    return (
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={refresh}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboardData) {
    return (
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="text-center">
          <p className="text-gray-500">No dashboard data available</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-6">
        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardStatsCard
            title="Room"
            value={dashboardData.roomInfo.roomNumber}
            subtitle={dashboardData.roomInfo.roomType}
            icon={House}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <DashboardStatsCard
            title="Monthly Rent"
            value={`₱${dashboardData.monthlyRent.toLocaleString()}`}
            subtitle="Per Month"
            icon={DollarSign}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <DashboardStatsCard
            title="Next Payment Due"
            value={dashboardData.nextPaymentDue}
            subtitle={`${dashboardData.daysRemaining} Days Remaining`}
            icon={Calendar}
            iconColor="text-yellow-600"
            iconBg="bg-yellow-100"
          />
          <DashboardStatsCard
            title="Account Status"
            value={dashboardData.accountStatus}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <p className="text-sm text-gray-500 mb-6">Common Task and Shortcuts</p>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <QuickActionButton key={action.id} action={action} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <p className="text-sm text-gray-500 mb-6">Your latest payments and requests</p>
            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity) => (
                <RecentActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
    </main>
  );
};

export default TenantDashboardPage;
