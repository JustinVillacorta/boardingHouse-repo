// Create Payment Modal Component
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiService from '../services/apiService';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentCreated: () => void;
}

interface TenantOption {
  _id: string;
  firstName: string;
  lastName: string;
  roomNumber: string;
}

interface RoomOption {
  _id: string;
  roomNumber: string;
  monthlyRent: number;
  currentTenant?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentCreated
}) => {
  const [formData, setFormData] = useState({
    tenant: '',
    room: '',
    amount: '',
    paymentType: 'rent',
    paymentMethod: 'bank_transfer',
    status: 'pending',
    dueDate: '',
    description: '',
    periodCovered: {
      startDate: '',
      endDate: ''
    }
  });
  
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTenantsAndRooms();
      // Set default due date to next month's 5th
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(5);
      setFormData(prev => ({
        ...prev,
        dueDate: nextMonth.toISOString().split('T')[0]
      }));
    }
  }, [isOpen]);

  const fetchTenantsAndRooms = async () => {
    try {
      const [tenantsResponse, roomsResponse] = await Promise.all([
        apiService.getTenants({ status: 'active' }),
        apiService.getRooms({ status: 'occupied' })
      ]);

      if (tenantsResponse.success) {
        setTenants(tenantsResponse.data || []);
      }

      if (roomsResponse.success) {
        setRooms(roomsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching tenants and rooms:', error);
      setError('Failed to load tenants and rooms');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const paymentData: any = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      // Only include periodCovered for rent payments
      if (formData.paymentType === 'rent' && formData.periodCovered.startDate && formData.periodCovered.endDate) {
        paymentData.periodCovered = formData.periodCovered;
      }

      const response = await apiService.createPayment(paymentData);

      if (response.success) {
        onPaymentCreated();
        onClose();
        // Reset form
        setFormData({
          tenant: '',
          room: '',
          amount: '',
          paymentType: 'rent',
          paymentMethod: 'bank_transfer',
          status: 'pending',
          dueDate: '',
          description: '',
          periodCovered: {
            startDate: '',
            endDate: ''
          }
        });
      } else {
        setError('Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setError('Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('periodCovered.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        periodCovered: {
          ...prev.periodCovered,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Auto-fill amount when room is selected for rent
    if (name === 'room' && formData.paymentType === 'rent') {
      const selectedRoom = rooms.find(room => room._id === value);
      if (selectedRoom) {
        setFormData(prev => ({
          ...prev,
          amount: selectedRoom.monthlyRent.toString(),
          tenant: selectedRoom.currentTenant?._id || ''
        }));
      }
    }

    // Auto-fill tenant when room is selected
    if (name === 'room') {
      const selectedRoom = rooms.find(room => room._id === value);
      if (selectedRoom && selectedRoom.currentTenant) {
        setFormData(prev => ({
          ...prev,
          tenant: selectedRoom.currentTenant!._id
        }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Create New Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room *
              </label>
              <select
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a room</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    Room {room.roomNumber} - ₱{room.monthlyRent}
                    {room.currentTenant && ` (${room.currentTenant.firstName} ${room.currentTenant.lastName})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Tenant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant *
              </label>
              <select
                name="tenant"
                value={formData.tenant}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a tenant</option>
                {tenants.map(tenant => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.firstName} {tenant.lastName} - Room {tenant.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type *
              </label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rent">Rent</option>
                <option value="deposit">Deposit</option>
                <option value="utility">Utility</option>
                <option value="maintenance">Maintenance</option>
                <option value="penalty">Penalty</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₱) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="digital_wallet">Digital Wallet</option>
                <option value="check">Check</option>
                <option value="money_order">Money Order</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Period Covered (for rent) */}
          {formData.paymentType === 'rent' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Start Date *
                </label>
                <input
                  type="date"
                  name="periodCovered.startDate"
                  value={formData.periodCovered.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period End Date *
                </label>
                <input
                  type="date"
                  name="periodCovered.endDate"
                  value={formData.periodCovered.endDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter payment description..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePaymentModal;