import React, { useState, useCallback, useEffect } from 'react';
import { X, Wifi, Tv, BookOpen, Bath, Wind, Eye, Refrigerator, Shirt, Bed, ChefHat, ShirtIcon, AlertCircle, CheckCircle } from 'lucide-react';
import type { CreateRoomRequest } from '../../domain/entities/Room';
import { roomValidationRules, validateField, validateForm, sanitizeInput } from '../../../../utils/validation';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (roomData: CreateRoomRequest) => Promise<void>;
}

interface FormData {
  // Basic Information
  roomNumber: string;
  roomType: 'single' | 'double' | 'triple' | 'quad' | 'suite' | 'studio';
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
  
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});

  // Clear form when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Clearing form for new room creation');
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
      
      // Clear validation states
      setFieldErrors({});
      setTouchedFields({});
      setValidFields({});
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

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

  // Real-time field validation
  const validateSingleField = useCallback((fieldName: string, value: any) => {
    const rules = roomValidationRules[fieldName];
    if (!rules) return;

    const result = validateField(value, rules, fieldName);
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: result.error || ''
    }));

    setValidFields(prev => ({
      ...prev,
      [fieldName]: result.isValid
    }));

    return result.isValid;
  }, []);

  // Mark field as touched when user interacts with it
  const markFieldAsTouched = useCallback((fieldName: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  // Get error message for a field (only show if touched)
  const getFieldError = useCallback((fieldName: string) => {
    return touchedFields[fieldName] ? fieldErrors[fieldName] : '';
  }, [touchedFields, fieldErrors]);

  // Get field validation state for styling
  const getFieldValidationState = useCallback((fieldName: string) => {
    if (!touchedFields[fieldName]) return 'default';
    return validFields[fieldName] ? 'valid' : 'invalid';
  }, [touchedFields, validFields]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input
    const sanitizedValue = sanitizeInput(value);
    
    // Convert to appropriate type
    const processedValue = name === 'capacity' || name === 'monthlyRent' || name === 'securityDeposit' || name === 'floor' || name === 'area' 
      ? Number(sanitizedValue) || 0 
      : sanitizedValue;

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Mark field as touched
    markFieldAsTouched(name);

    // Validate field in real-time
    validateSingleField(name, processedValue);

    // Clear any global error when user makes changes
    if (error) setError(null);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];

    setFormData(prev => ({
      ...prev,
      amenities: newAmenities
    }));

    // Mark amenities field as touched and validate
    markFieldAsTouched('amenities');
    validateSingleField('amenities', newAmenities);
  };

  const validateFormData = (): { isValid: boolean; firstError?: string } => {
    const result = validateForm(formData, roomValidationRules);
    
    // Update all field errors
    setFieldErrors(result.errors);
    
    // Mark all fields as touched to show errors
    const allFieldNames = Object.keys(roomValidationRules);
    const touchedState: Record<string, boolean> = {};
    allFieldNames.forEach(fieldName => {
      touchedState[fieldName] = true;
    });
    setTouchedFields(touchedState);

    // Update valid fields state
    const validState: Record<string, boolean> = {};
    allFieldNames.forEach(fieldName => {
      validState[fieldName] = !result.errors[fieldName];
    });
    setValidFields(validState);

    return {
      isValid: result.isValid,
      firstError: result.firstError
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) {
      return;
    }
    
    const validation = validateFormData();
    if (!validation.isValid) {
      setError(validation.firstError || 'Please fix the errors above');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const roomData: CreateRoomRequest = {
        roomNumber: formData.roomNumber.trim(),
        roomType: formData.roomType,
        capacity: formData.capacity,
        monthlyRent: formData.monthlyRent,
        description: formData.description?.trim() || undefined,
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
    
    // Reset validation states
    setFieldErrors({});
    setTouchedFields({});
    setValidFields({});
    setError(null);
    setSuccess(null);
  };

  // Get CSS classes for input fields based on validation state
  const getInputClasses = (fieldName: string) => {
    const baseClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors";
    const state = getFieldValidationState(fieldName);
    
    switch (state) {
      case 'valid':
        return `${baseClasses} border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent`;
      case 'invalid':
        return `${baseClasses} border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent`;
      default:
        return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent`;
    }
  };

  // Validation feedback component
  const ValidationFeedback: React.FC<{ fieldName: string }> = ({ fieldName }) => {
    const error = getFieldError(fieldName);
    const isValid = touchedFields[fieldName] && validFields[fieldName];
    
    if (!touchedFields[fieldName]) return null;
    
    return (
      <div className="mt-1 flex items-center gap-1">
        {error ? (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">{error}</span>
          </>
        ) : isValid ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600">Valid</span>
          </>
        ) : null}
      </div>
    );
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  onBlur={() => markFieldAsTouched('roomNumber')}
                  placeholder="e.g., 105-A184"
                  className={getInputClasses('roomNumber')}
                  required
                />
                <ValidationFeedback fieldName="roomNumber" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  onBlur={() => markFieldAsTouched('roomType')}
                  className={getInputClasses('roomType')}
                  required
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="quad">Quad</option>
                  <option value="suite">Suite</option>
                  <option value="studio">Studio</option>
                </select>
                <ValidationFeedback fieldName="roomType" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  onBlur={() => markFieldAsTouched('capacity')}
                  min="1"
                  max="10"
                  placeholder="Number of beds"
                  className={getInputClasses('capacity')}
                  required
                />
                <ValidationFeedback fieldName="capacity" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  onBlur={() => markFieldAsTouched('status')}
                  className={getInputClasses('status')}
                  required
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                <ValidationFeedback fieldName="status" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleInputChange}
                  onBlur={() => markFieldAsTouched('monthlyRent')}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 1350"
                  className={getInputClasses('monthlyRent')}
                  required
                />
                <ValidationFeedback fieldName="monthlyRent" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  onBlur={() => markFieldAsTouched('securityDeposit')}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 2700"
                  className={getInputClasses('securityDeposit')}
                />
                <ValidationFeedback fieldName="securityDeposit" />
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
                onBlur={() => markFieldAsTouched('description')}
                placeholder="Additional room description (optional)"
                rows={3}
                className={getInputClasses('description')}
              />
              <ValidationFeedback fieldName="description" />
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
                  onBlur={() => markFieldAsTouched('floor')}
                  min="0"
                  max="100"
                  className={getInputClasses('floor')}
                />
                <ValidationFeedback fieldName="floor" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq meters)</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  onBlur={() => markFieldAsTouched('area')}
                  min="0"
                  step="0.1"
                  className={getInputClasses('area')}
                />
                <ValidationFeedback fieldName="area" />
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 text-sm font-medium">Validation Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  {Object.keys(fieldErrors).length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-600 text-xs">Please check the following fields:</p>
                      <ul className="list-disc list-inside text-red-600 text-xs mt-1">
                        {Object.entries(fieldErrors).map(([field, errorMsg]) => (
                          <li key={field}>{errorMsg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
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
              className={`px-6 py-2 rounded-lg transition-colors ${
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
