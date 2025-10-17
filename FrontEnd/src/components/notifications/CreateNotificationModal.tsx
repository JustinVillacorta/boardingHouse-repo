import React, { useState, useEffect } from 'react';
import { X, Send, Users, User as UserIcon } from 'lucide-react';
import type { CreateNotificationData, BroadcastNotificationData } from '../../types/notification';
import notificationService from '../../services/notificationService';
import apiService from '../../services/apiService';

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  tenant?: {
    firstName: string;
    lastName: string;
  };
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'other' as const,
    expiresAt: '',
    sendTo: 'specific' as 'specific' | 'role',
    selectedUsers: [] as string[],
    selectedRoles: [] as string[],
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  const notificationTypes = [
    { value: 'payment_due', label: 'Payment Due' },
    { value: 'report_update', label: 'Report Update' },
    { value: 'system_alert', label: 'System Alert' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'lease_reminder', label: 'Lease Reminder' },
    { value: 'other', label: 'Other' },
  ];

  const roles = [
    { value: 'tenant', label: 'Tenants' },
    { value: 'staff', label: 'Staff' },
    { value: 'admin', label: 'Admins' },
  ];

  // Load users when modal opens
  useEffect(() => {
    if (isOpen && formData.sendTo === 'specific') {
      loadUsers();
    }
  }, [isOpen, formData.sendTo]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await apiService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'other',
      expiresAt: '',
      sendTo: 'specific',
      selectedUsers: [],
      selectedRoles: [],
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Title and message are required');
      return;
    }

    if (formData.sendTo === 'specific' && formData.selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (formData.sendTo === 'role' && formData.selectedRoles.length === 0) {
      setError('Please select at least one role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (formData.sendTo === 'specific') {
        // Send to specific users
        const broadcastData: BroadcastNotificationData = {
          title: formData.title,
          message: formData.message,
          type: formData.type,
          userIds: formData.selectedUsers,
          ...(formData.expiresAt && { expiresAt: formData.expiresAt }),
        };

        await notificationService.broadcastNotification(broadcastData);
      } else {
        // Send to roles
        const broadcastData: BroadcastNotificationData = {
          title: formData.title,
          message: formData.message,
          type: formData.type,
          roles: formData.selectedRoles,
          ...(formData.expiresAt && { expiresAt: formData.expiresAt }),
        };

        await notificationService.broadcastNotification(broadcastData);
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter(r => r !== role)
        : [...prev.selectedRoles, role]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Notification</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter notification title"
              maxLength={200}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter notification message"
              maxLength={1000}
            />
          </div>

          {/* Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires At (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Send To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send To
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sendTo"
                  value="specific"
                  checked={formData.sendTo === 'specific'}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendTo: e.target.value as any }))}
                  className="mr-2"
                />
                <UserIcon className="w-4 h-4 mr-1" />
                Specific Users
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sendTo"
                  value="role"
                  checked={formData.sendTo === 'role'}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendTo: e.target.value as any }))}
                  className="mr-2"
                />
                <Users className="w-4 h-4 mr-1" />
                By Role
              </label>
            </div>
          </div>

          {/* User Selection */}
          {formData.sendTo === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Users *
              </label>
              {loadingUsers ? (
                <div className="p-4 text-center text-gray-500">Loading users...</div>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {users.map(user => (
                    <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={formData.selectedUsers.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <span className="font-medium">
                          {user.tenant 
                            ? `${user.tenant.firstName} ${user.tenant.lastName}` 
                            : user.username
                          }
                        </span>
                        <div className="text-sm text-gray-500">
                          {user.email} • {user.role}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role Selection */}
          {formData.sendTo === 'role' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Roles *
              </label>
              <div className="space-y-2">
                {roles.map(role => (
                  <label key={role.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.selectedRoles.includes(role.value)}
                      onChange={() => handleRoleToggle(role.value)}
                      className="mr-3"
                    />
                    <span className="font-medium">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationModal;