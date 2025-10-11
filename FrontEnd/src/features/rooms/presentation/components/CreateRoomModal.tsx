import React, { useState } from 'react';
import { X, Wifi, Tv, BookOpen, Bath, Wind, Eye, Refrigerator, Shirt, Bed, ChefHat, ShirtIcon } from 'lucide-react';
import type { CreateRoomRequest } from '../../domain/entities/Room';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (roomData: CreateRoomRequest) => Promise<void>;
}

interface FormData {
  // Basic Information
  roomNumber: string;
  roomType: 'single' | 'double' | 'shared' | 'suite';
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  
  // Pricing Information
  monthlyRent: number;
  securityDeposit: number;
  
  // Room Amenities
  amenities: string[];
  
  // Room Description
  description: string;
  
  // Additional Fields
  floor: number;
  area: number;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onRoomCreated }) => {
  const [formData, setFormData] = useState<FormData>({
    roomNumber: '',
    roomType: 'single',
    capacity: 1,
    status: 'available',
    monthlyRent: 0,
    securityDeposit: 0,
    amenities: [],
    description: '',
    floor: 1,
    area: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const predefinedAmenities = [
    { name: 'Wifi', icon: Wifi },
    { name: 'TV', icon: Tv },
    { name: 'Study Desk', icon: BookOpen },
    { name: 'Private Bathroom', icon: Bath },
    { name: 'Air Conditioning', icon: Wind },
    { name: 'Window View', icon: Eye },
    { name: 'Mini Fridge', icon: Refrigerator },
    { name: 'Closet/Wardrobe', icon: Shirt },
    { name: 'Bed with Mattress', icon: Bed },
    { name: 'Kitchen Access', icon: ChefHat },
    { name: 'Laundry Access', icon: ShirtIcon },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'monthlyRent' || name === 'securityDeposit' || name === 'floor' || name === 'area' 
        ? Number(value) || 0 
        : value
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.roomNumber.trim()) return 'Room number is required';
    if (formData.capacity < 1) return 'Capacity must be at least 1';
    if (formData.monthlyRent <= 0) return 'Monthly rent must be greater than 0';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) {
      return;
    }
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const roomData: CreateRoomRequest = {
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        capacity: formData.capacity,
        monthlyRent: formData.monthlyRent,
        description: formData.description || undefined,
        amenities: formData.amenities,
        floor: formData.floor || undefined,
        area: formData.area || undefined,
        status: formData.status,
      };

      await onRoomCreated(roomData);
      setSuccess('Room created successfully!');
      
      // Reset form immediately after successful creation
      handleClear();
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      roomNumber: '',
      roomType: 'single',
      capacity: 1,
      status: 'available',
      monthlyRent: 0,
      securityDeposit: 0,
      amenities: [],
      description: '',
      floor: 1,
      area: 0,
    });
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create New Room</h2>
            <p className="text-sm text-gray-600 mt-1">
              Add a new room to the boarding house. Complete all required information below.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 105-A184"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="shared">Shared</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Number of beds"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Pricing Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent</label>
                <input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g., 1350"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g., 1350"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Room Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Room Amenities
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {predefinedAmenities.map((amenity) => (
                <button
                  key={amenity.name}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity.name)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    formData.amenities.includes(amenity.name)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <amenity.icon className="w-4 h-4" />
                  <span className="text-sm">{amenity.name}</span>
                </button>
              ))}
            </div>

            {formData.amenities.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleAmenityToggle(amenity)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Room Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Room Description
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Additional room description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq meters)</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
