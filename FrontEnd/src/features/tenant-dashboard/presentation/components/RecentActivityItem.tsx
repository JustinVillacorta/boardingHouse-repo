import React from "react";
import { DollarSign, Wrench, Bell } from "lucide-react";
import type { RecentActivity } from "../../domain/entities/TenantDashboard";

interface RecentActivityItemProps {
  activity: RecentActivity;
}

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({ activity }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-orange-600" />;
      case 'announcement':
        return <Bell className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex-shrink-0">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500">{activity.time}</p>
      </div>
      <div className="flex-shrink-0">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
          {activity.status}
        </span>
      </div>
    </div>
  );
};

export default RecentActivityItem;
