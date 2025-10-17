import React, { useState, useEffect } from 'react';
import { X, Plus, User, DollarSign, AlertCircle, CheckCircle, Users, Search } from 'lucide-react';
import type { Room, TenantAssignmentRequest } from '../../domain/entities/Room';

interface AssignTenantsModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onTenantsAssigned: (updatedRoom: Room) => void;
  roomsRepository: any; // Using any for now, should be properly typed
  tenantsRepository: any; // Using any for now, should be properly typed
}

interface AvailableTenant {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  tenantStatus: string;
  userId: string;
}

interface TenantAssignment extends TenantAssignmentRequest {
  tenant?: AvailableTenant;
  tempId: string;
}

const AssignTenantsModal: React.FC<AssignTenantsModalProps> = ({
  room,
  isOpen,
  onClose,
  onTenantsAssigned,
  roomsRepository,
  tenantsRepository
}) => {
  const [availableTenants, setAvailableTenants] = useState<AvailableTenant[]>([]);
  const [assignments, setAssignments] = useState<TenantAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSpots = room.capacity - (room.currentTenants?.length || 0);
  const maxAssignments = availableSpots;

  useEffect(() => {
    if (isOpen) {
      loadAvailableTenants();
      // Initialize with one empty assignment
      setAssignments([createEmptyAssignment()]);
    } else {
      // Reset when modal closes
      setAssignments([]);
      setSearchTerm('');
      setError(null);
    }
  }, [isOpen]);

  const createEmptyAssignment = (): TenantAssignment => ({
    tenantId: '',
    rentAmount: room.monthlyRent,
    tempId: Math.random().toString(36).substr(2, 9)
  });

  const loadAvailableTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all tenants that are available (not currently assigned to rooms)
      const response = await tenantsRepository.getAvailableTenants();
      
      if (response.success) {
        setAvailableTenants(response.data.tenants || []);
      } else {
        setError('Failed to load available tenants');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const addAssignment = () => {
    if (assignments.length < maxAssignments) {
      setAssignments([...assignments, createEmptyAssignment()]);
    }
  };

  const removeAssignment = (tempId: string) => {
    setAssignments(assignments.filter(a => a.tempId !== tempId));
  };

  const updateAssignment = (tempId: string, field: keyof TenantAssignment, value: any) => {
    setAssignments(assignments.map(a => 
      a.tempId === tempId 
        ? { 
            ...a, 
            [field]: value,
            // If selecting a tenant, also store the tenant object for display
            ...(field === 'tenantId' && value ? { 
              tenant: availableTenants.find(t => t._id === value) 
            } : {})
          }
        : a
    ));
  };



  const getFilteredTenants = () => {
    const selectedIds = assignments.map(a => a.tenantId).filter(Boolean);
    const filtered = availableTenants.filter(tenant => 
      !selectedIds.includes(tenant._id) &&
      (tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       tenant.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return filtered;
  };

  const validateAssignments = () => {
    const errors: string[] = [];
    const validAssignments = assignments.filter(a => a.tenantId);

    if (validAssignments.length === 0) {
      errors.push('At least one tenant must be selected');
    }

    validAssignments.forEach((assignment, index) => {
      if (!assignment.tenantId) {
        errors.push(`Assignment ${index + 1}: Please select a tenant`);
      }
      if (!assignment.rentAmount || assignment.rentAmount <= 0) {
        errors.push(`Assignment ${index + 1}: Rent amount must be greater than 0`);
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const errors = validateAssignments();
      
      if (errors.length > 0) {
        setError(errors.join('. '));
        return;
      }

      setIsSubmitting(true);

      const validAssignments = assignments
        .filter(a => a.tenantId)
        .map(({ tempId, tenant, ...assignment }) => assignment);

      const response = await roomsRepository.assignTenantsToRoom(room._id, {
        tenants: validAssignments
      });

      if (response.success) {
        onTenantsAssigned(response.data);
        onClose();
      } else {
        setError(response.message || 'Failed to assign tenants');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to assign tenants');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredTenants = getFilteredTenants();
  const validAssignmentCount = assignments.filter(a => a.tenantId).length;
  const canAddMore = assignments.length < maxAssignments;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Assign Tenants to Room</h2>
            <p className="text-sm text-gray-600 mt-1">
              Room {room.roomNumber} - {availableSpots} spot{availableSpots !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Room Info */}
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Capacity</p>
                <p className="text-sm text-blue-700">{room.capacity} total</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Current Occupancy</p>
                <p className="text-sm text-green-700">{room.currentTenants?.length || 0} tenant{(room.currentTenants?.length || 0) !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Default Rent</p>
                <p className="text-sm text-gray-700">${room.monthlyRent}/month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">Loading available tenants...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tenant Search */}
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tenants by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tenant Assignments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Tenant Assignments ({validAssignmentCount}/{maxAssignments})
                  </h3>
                  {canAddMore && (
                    <button
                      onClick={addAssignment}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Assignment
                    </button>
                  )}
                </div>

                {assignments.map((assignment, index) => (
                  <div key={assignment.tempId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Assignment #{index + 1}</h4>
                      {assignments.length > 1 && (
                        <button
                          onClick={() => removeAssignment(assignment.tempId)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tenant Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Tenant *
                        </label>
                        <select
                          value={assignment.tenantId}
                          onChange={(e) => updateAssignment(assignment.tempId, 'tenantId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Choose a tenant...</option>
                          {filteredTenants.map((tenant) => (
                            <option key={tenant._id} value={tenant._id}>
                              {tenant.fullName} - {tenant.email}
                            </option>
                          ))}
                        </select>
                        
                        {assignment.tenant && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{assignment.tenant.fullName}</span>
                            </div>
                            <p className="text-blue-700 mt-1">{assignment.tenant.email}</p>
                            {assignment.tenant.phoneNumber && (
                              <p className="text-blue-700">{assignment.tenant.phoneNumber}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Rent Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Rent *
                        </label>
                        <div className="relative">
                          <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="number"
                            value={assignment.rentAmount || ''}
                            onChange={(e) => updateAssignment(assignment.tempId, 'rentAmount', parseFloat(e.target.value) || 0)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter rent amount"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>


                    </div>
                  </div>
                ))}

                {assignments.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No tenant assignments yet</p>
                    <button
                      onClick={addAssignment}
                      className="mt-2 flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Assignment
                    </button>
                  </div>
                )}
              </div>

              {/* Available Tenants Count */}
              {filteredTenants.length === 0 && searchTerm && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    No available tenants match your search. Try a different search term or check if all tenants are already assigned to rooms.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {validAssignmentCount > 0 && (
              <span>
                Assigning {validAssignmentCount} tenant{validAssignmentCount !== 1 ? 's' : ''} to room {room.roomNumber}
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || validAssignmentCount === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Assign Tenant{validAssignmentCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTenantsModal;