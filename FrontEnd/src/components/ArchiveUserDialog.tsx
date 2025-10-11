import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import apiService from '../services/apiService';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'tenant';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface ArchiveUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserArchived: () => void;
  user: User | null;
}

const ArchiveUserDialog: React.FC<ArchiveUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onUserArchived, 
  user 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArchive = async () => {
    if (!user) {
      setError('No user selected for archiving');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call API to archive user (set isActive to false)
      const response = await apiService.updateUser(user._id, {
        isActive: false
      });

      if (response.success) {
        onUserArchived();
      } else {
        setError(response.message || 'Failed to archive user');
      }

    } catch (error: any) {
      setError(error.message || 'Failed to archive user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Archive User</h2>
              <p className="text-sm text-gray-600">This action can be undone later</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Are you sure you want to archive the following user?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{user.username}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role} • {user.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">What happens when you archive a user:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>The user account will be deactivated</li>
                  <li>The user won't be able to log in</li>
                  <li>User data will be preserved</li>
                  <li>You can reactivate the account later if needed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Archiving...' : 'Archive User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveUserDialog;