import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Trash2, DollarSign, AlertCircle, CheckCircle, User, Phone, Mail, Calendar } from 'lucide-react';
import type { Room, RoomTenantSummary } from '../../domain/entities/Room';
import AddTenantModal from './AddTenantModal';

interface RoomTenantsManagerProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onTenantsUpdated: (updatedRoom: Room) => void;
  roomsRepository: any; // Using any for now, should be properly typed
}

interface RemoveTenantModalProps {
  tenant: RoomTenantSummary;
  roomNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tenantId: string) => Promise<void>;
  isLoading: boolean;
}

const RemoveTenantModal: React.FC<RemoveTenantModalProps> = ({
  tenant,
  roomNumber,
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-red-600">Remove Tenant</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Confirm Tenant Removal</p>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tenant:</span>
                <span className="font-medium text-gray-900">{tenant.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Room:</span>
                <span className="font-medium text-gray-900">{roomNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Rent:</span>
                <span className="font-medium text-gray-900">${tenant.rentAmount}</span>
              </div>

            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The tenant will be moved to rental history. 
              Make sure to handle any pending payments or security deposit refunds separately.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(tenant.tenantId)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Remove Tenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomTenantsManager: React.FC<RoomTenantsManagerProps> = ({
  room,
  isOpen,
  onClose,
  onTenantsUpdated,
  roomsRepository
}) => {
  const [tenants, setTenants] = useState<RoomTenantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [tenantToRemove, setTenantToRemove] = useState<RoomTenantSummary | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [addTenantModalOpen, setAddTenantModalOpen] = useState(false);

  // Calculate room occupancy info
  const availableSpots = room.capacity - (room.currentTenants?.length || 0);
  const isRoomFull = availableSpots <= 0;

  // Load tenants when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTenants();
    }
  }, [isOpen, room._id]);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await roomsRepository.getRoomTenants(room._id, true);
      
      if (response.success) {
        setTenants(response.data.tenants);
      } else {
        setError(response.message || 'Failed to load tenants');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTenant = (tenant: RoomTenantSummary) => {
    setTenantToRemove(tenant);
    setRemoveModalOpen(true);
  };

  const confirmRemoveTenant = async (tenantId: string) => {
    try {
      setIsRemoving(true);
      setError(null);

      const response = await roomsRepository.removeTenantFromRoom(room._id, tenantId);
      
      if (response.success) {
        setSuccess('Tenant removed successfully');
        setRemoveModalOpen(false);
        setTenantToRemove(null);
        
        // Refresh tenants list
        await loadTenants();
        
        // Notify parent component
        onTenantsUpdated(response.data);
        
        // Auto-hide success message
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to remove tenant');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove tenant');
    } finally {
      setIsRemoving(false);
    }
  };

  const activeTenants = tenants.filter(t => t.status === 'active');
  const inactiveTenants = tenants.filter(t => t.status === 'inactive');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Manage Room Tenants</h2>
              <p className="text-sm text-gray-600 mt-1">
                Room {room.roomNumber} - {activeTenants.length}/{room.capacity} occupied
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Room Occupancy Status */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Capacity</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-1">{room.capacity}</p>
                <p className="text-sm text-blue-700">Total spots</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Occupied</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-1">{activeTenants.length}</p>
                <p className="text-sm text-green-700">Current tenants</p>
              </div>
              
              <div className={`${isRoomFull ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                <div className="flex items-center gap-2">
                  <Plus className={`w-5 h-5 ${isRoomFull ? 'text-red-600' : 'text-gray-600'}`} />
                  <span className={`font-medium ${isRoomFull ? 'text-red-900' : 'text-gray-900'}`}>Available</span>
                </div>
                <p className={`text-2xl font-bold mt-1 ${isRoomFull ? 'text-red-600' : 'text-gray-600'}`}>{availableSpots}</p>
                <p className={`text-sm ${isRoomFull ? 'text-red-700' : 'text-gray-700'}`}>
                  {isRoomFull ? 'Room is full' : 'Spots remaining'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Room Details Section */}
          <div className="px-6 pt-4 pb-2 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Room Type & Capacity */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{room.capacity}</div>
                <div className="text-sm text-gray-600">Max Capacity</div>
                <div className="text-xs text-gray-500 mt-1">{room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} Room</div>
              </div>
              
              {/* Monthly Rent */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₱{room.monthlyRent.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Monthly Rent</div>
                {room.securityDeposit && room.securityDeposit > 0 && (
                  <div className="text-xs text-gray-500 mt-1">₱{room.securityDeposit.toLocaleString()} Security Deposit</div>
                )}
              </div>
              
              {/* Room Status */}
              <div className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  room.status === 'available' ? 'bg-green-100 text-green-800' :
                  room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                  room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Room Status</div>
                {room.floor && <div className="text-xs text-gray-500">Floor {room.floor}</div>}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">Loading tenants...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Tenants */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Current Tenants ({activeTenants.length})
                  </h3>
                  
                  {activeTenants.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No current tenants in this room</p>
                      <p className="text-sm text-gray-500 mt-1">Room is available for new tenants</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTenants.map((tenant) => (
                        <div key={tenant.tenantId} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{tenant.name}</h4>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveTenant(tenant)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Remove tenant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2 text-sm">
                            {tenant.email && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{tenant.email}</span>
                              </div>
                            )}
                            {tenant.phoneNumber && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{tenant.phoneNumber}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Since {new Date(tenant.assignedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-medium">${tenant.rentAmount}/month</span>
                            </div>
                          </div>


                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rental History */}
                {inactiveTenants.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      Rental History ({inactiveTenants.length})
                    </h3>
                    
                    <div className="space-y-3">
                      {inactiveTenants.map((tenant) => (
                        <div key={`${tenant.tenantId}-${tenant.assignedDate}`} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{tenant.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>{new Date(tenant.assignedDate).toLocaleDateString()} - {tenant.endDate ? new Date(tenant.endDate).toLocaleDateString() : 'Present'}</span>
                                  <span>${tenant.rentAmount}/month</span>
                                </div>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setAddTenantModalOpen(true)}
              disabled={isRoomFull}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isRoomFull 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Tenant
            </button>
          </div>
        </div>
      </div>

      {/* Add Tenant Modal */}
      <AddTenantModal
        isOpen={addTenantModalOpen}
        onClose={() => setAddTenantModalOpen(false)}
        roomId={room._id}
        roomNumber={room.roomNumber}
        roomCapacity={room.capacity}
        currentOccupancy={room.currentTenants?.length || 0}
        monthlyRent={room.monthlyRent}
        onTenantAdded={() => {
          setAddTenantModalOpen(false);
          loadTenants(); // Refresh the tenants list
          setSuccess('Tenant added successfully');
        }}
      />

      {/* Remove Tenant Confirmation Modal */}
      <RemoveTenantModal
        tenant={tenantToRemove!}
        roomNumber={room.roomNumber}
        isOpen={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false);
          setTenantToRemove(null);
        }}
        onConfirm={confirmRemoveTenant}
        isLoading={isRemoving}
      />
    </>
  );
};

export default RoomTenantsManager;