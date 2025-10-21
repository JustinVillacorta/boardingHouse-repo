import React from "react";
import { DollarSign, Wrench, Bell, CheckCircle, Calendar } from "lucide-react";
import type { Notification } from "../../domain/entities/Notification";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onMarkAsRead 
}) => {
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'dollar-sign': <DollarSign className="w-5 h-5 text-blue-600" />,
      'wrench': <Wrench className="w-5 h-5 text-orange-600" />,
      'bell': <Bell className="w-5 h-5 text-green-600" />,
      'check-circle': <CheckCircle className="w-5 h-5 text-green-600" />,
      'calendar': <Calendar className="w-5 h-5 text-purple-600" />,
    };
    return iconMap[iconName] || <Bell className="w-5 h-5 text-gray-600" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-blue-100 text-blue-600';
      case 'maintenance':
        return 'bg-orange-100 text-orange-600';
      case 'announcement':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div 
      className={`p-6 rounded-xl border transition-colors cursor-pointer shadow-sm hover:shadow-md ${
        notification.isRead 
          ? 'bg-white border-gray-200' 
          : 'bg-blue-50 border-blue-200'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-semibold ${
              notification.isRead ? 'text-gray-900' : 'text-gray-900'
            }`}>
              {notification.title}
            </h3>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(notification.type)}`}>
                {notification.type}
              </span>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </div>
          <p className={`text-base leading-relaxed mb-3 ${
            notification.isRead ? 'text-gray-600' : 'text-gray-700'
          }`}>
            {notification.message}
          </p>
          <p className="text-sm text-gray-500">
            {notification.timestamp}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
