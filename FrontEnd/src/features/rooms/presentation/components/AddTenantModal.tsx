import React, { useState, useEffect } from 'react';
import { X, Plus, Search, UserPlus } from 'lucide-react';

interface Tenant {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  roomNumber?: string;
  tenantStatus: 'active' | 'inactive' | 'pending' | 'terminated';
  monthlyRent?: number;
}

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomNumber: string;
  roomCapacity: number;
  currentOccupancy: number;
  monthlyRent: number;
  onTenantAdded: () => void;
}

const AddTenantModal: React.FC<AddTenantModalProps> = ({
  isOpen,
  onClose,
  roomId,
  roomNumber,
  roomCapacity,
  currentOccupancy,
  monthlyRent,
  onTenantAdded
}) => {
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [customRentAmount, setCustomRentAmount] = useState<number>(monthlyRent);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Load available tenants when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableTenants();
      setCustomRentAmount(monthlyRent);
      setSearchQuery('');
      setSelectedTenant('');
      setError('');
    }
  }, [isOpen, monthlyRent]);

  // Filter tenants based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTenants(availableTenants);
    } else {
      const filtered = availableTenants.filter(tenant =>
        tenant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.phoneNumber.includes(searchQuery)
      );
      setFilteredTenants(filtered);
    }
  }, [searchQuery, availableTenants]);

  const loadAvailableTenants = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tenants?status=active', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load available tenants');
      }

      const data = await response.json();
      if (data.success) {
        // Filter out tenants who already have rooms
        const unassignedTenants = data.data.filter((tenant: Tenant) => 
          !tenant.roomNumber || tenant.roomNumber === null
        );
        setAvailableTenants(unassignedTenants);
      } else {
        setError(data.message || 'Failed to load tenants');
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTenant = async () => {
    if (!selectedTenant) {
      setError('Please select a tenant');
      return;
    }

    if (customRentAmount <= 0) {
      setError('Rent amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/rooms/${roomId}/tenants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenants: [{
            tenantId: selectedTenant,
            rentAmount: customRentAmount
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign tenant');
      }

      const data = await response.json();
      if (data.success) {
        onTenantAdded();
        onClose();
      } else {
        setError(data.message || 'Failed to assign tenant');
      }
    } catch (error) {
      console.error('Error assigning tenant:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRoomFull = currentOccupancy >= roomCapacity;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Tenant</h2>
            <p className="text-sm text-gray-600 mt-1">
              Room {roomNumber} • {currentOccupancy}/{roomCapacity} occupied
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isRoomFull ? (
            <div className="text-center py-8">
              <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Room at Full Capacity</h3>
              <p className="text-gray-600">
                This room is currently at maximum capacity ({roomCapacity} tenants).
                You cannot add more tenants.
              </p>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tenants by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Available Tenants List */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Tenants ({filteredTenants.length})
                </label>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading tenants...</p>
                  </div>
                ) : filteredTenants.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchQuery ? 'No tenants match your search' : 'No available tenants found'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredTenants.map((tenant) => (
                      <label
                        key={tenant._id}
                        className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedTenant === tenant._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedTenant"
                          value={tenant._id}
                          checked={selectedTenant === tenant._id}
                          onChange={(e) => setSelectedTenant(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-900">{tenant.fullName}</div>
                          <div className="text-sm text-gray-500">{tenant.phoneNumber}</div>
                          <div className={`text-xs inline-flex px-2 py-1 rounded-full mt-1 ${
                            tenant.tenantStatus === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tenant.tenantStatus.charAt(0).toUpperCase() + tenant.tenantStatus.slice(1)}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Rent Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customRentAmount}
                    onChange={(e) => setCustomRentAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Default room rent: ₱{monthlyRent.toLocaleString()}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {!isRoomFull && (
            <button
              onClick={handleAssignTenant}
              disabled={isSubmitting || !selectedTenant || isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
                isSubmitting || !selectedTenant || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Tenant
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTenantModal;