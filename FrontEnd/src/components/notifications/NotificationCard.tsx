import React from 'react';
import { 
  CheckCircle, 
  Play, 
  Pause,
  Clock, 
  AlertCircle,
  Calendar,
  User,
  X,
  Bell
} from 'lucide-react';
import type { Notification } from '../../types/notification';
import notificationService from '../../services/notificationService';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}) => {
  const getStatusIcon = (type: string) => {
    switch (type) {
      case "payment_due":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "report_update":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "maintenance":
        return <Play className="w-4 h-4 text-orange-500" />;
      case "announcement":
        return <Bell className="w-4 h-4 text-purple-500" />;
      case "system_alert":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "lease_reminder":
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'unread' 
      ? "bg-blue-50 border-blue-200" 
      : "bg-white border-gray-200";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "payment_due":
        return "bg-red-100 text-red-800";
      case "report_update":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      case "announcement":
        return "bg-purple-100 text-purple-800";
      case "system_alert":
        return "bg-red-100 text-red-800";
      case "lease_reminder":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = () => {
    if (notification.status === 'unread') {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  return (
    <div
      className={`border rounded-lg shadow-sm border-l-4 ${getPriorityColor(notification.priority)} ${getStatusColor(notification.status)} p-6 hover:shadow-md transition-shadow relative`}
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
        title="Delete notification"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start justify-between pr-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon(notification.type)}
            <h3 className={`text-lg font-semibold ${notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
              {notification.type.replace('_', ' ')}
            </span>
            {notification.status === 'unread' && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>

          <p className={`mb-4 ${notification.status === 'unread' ? 'text-gray-800' : 'text-gray-600'}`}>
            {notificationService.formatNotificationMessage(notification)}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {notification.createdBy && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Created by {notification.createdBy}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(notification.createdAt)}</span>
            </div>
            {notification.expiresAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Expires {formatDate(notification.expiresAt)}</span>
              </div>
            )}
          </div>

          {/* Metadata display */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Information:</h4>
              <div className="space-y-1">
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <div key={key} className="text-sm text-gray-600">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {notification.status === 'unread' && (
            <div className="mt-4">
              <button
                onClick={handleMarkAsRead}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Mark as Read
              </button>
            </div>
          )}
        </div>

        <div className="ml-6 text-right">
          <div className="text-sm text-gray-500 mb-2">Priority</div>
          <div className="flex flex-col items-end">
            <span className={`px-3 py-2 rounded-lg text-sm font-medium border ${
              notification.priority === 'urgent' 
                ? 'bg-red-50 text-red-800 border-red-200'
                : notification.priority === 'high'
                ? 'bg-orange-50 text-orange-800 border-orange-200'
                : notification.priority === 'medium'
                ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                : 'bg-green-50 text-green-800 border-green-200'
            }`}>
              {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;