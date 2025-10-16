import React, { useState, useEffect } from 'react';
import { X, User, Users } from 'lucide-react';
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

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User | null;
  currentUserRole?: 'admin' | 'staff' | 'tenant';
}

interface EditFormData {
  // Common fields
  username: string;
  email: string;
  role: 'staff' | 'tenant';
  isActive: boolean;
  
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  occupation: string;
  
  // Address Information
  street: string;
  province: string;
  city: string;
  zipCode: string;
  
  // Tenant-specific fields
  roomNumber: string;
  monthlyRent: string;
  securityDeposit: string;
  idType: string;
  idNumber: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onUserUpdated, 
  user,
  currentUserRole = 'admin'
}) => {
  const [formData, setFormData] = useState<EditFormData>({
    username: '',
    email: '',
    role: 'tenant',
    isActive: true,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    occupation: '',
    street: '',
    province: '',
    city: '',
    zipCode: '',
    roomNumber: '',
    monthlyRent: '',
    securityDeposit: '',
    idType: 'passport',
    idNumber: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch full user details and update form data when user prop changes
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = user?._id || (user as any)?.id;
      if (user && userId) {
        try {
          setIsLoading(true);
          const response = await apiService.getUserById(userId);
          
          if (response.success && response.data) {
            const userData = response.data;
            setFormData({
              username: userData.username,
              email: userData.email,
              role: userData.role === 'admin' ? 'staff' : userData.role,
              isActive: userData.isActive,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
              phoneNumber: userData.phoneNumber || '',
              occupation: userData.occupation || '',
              street: userData.street || '',
              province: userData.province || '',
              city: userData.city || '',
              zipCode: userData.zipCode || '',
              roomNumber: userData.roomNumber || '',
              monthlyRent: userData.monthlyRent ? String(userData.monthlyRent) : '',
              securityDeposit: userData.securityDeposit ? String(userData.securityDeposit) : '',
              idType: userData.idType || 'passport',
              idNumber: userData.idNumber || '',
              emergencyContactName: userData.emergencyContact?.name || '',
              emergencyContactRelationship: userData.emergencyContact?.relationship || '',
              emergencyContactPhone: userData.emergencyContact?.phoneNumber || '',
            });
          } else {
            // Fallback to the basic user data passed as prop
            setFormData({
              username: user.username,
              email: user.email,
              role: user.role === 'admin' ? 'staff' : user.role,
              isActive: user.isActive,
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              phoneNumber: '',
              occupation: '',
              street: '',
              province: '',
              city: '',
              zipCode: '',
              roomNumber: '',
              monthlyRent: '',
              securityDeposit: '',
              idType: 'passport',
              idNumber: '',
              emergencyContactName: '',
              emergencyContactRelationship: '',
              emergencyContactPhone: '',
            });
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          setError('Failed to load user details');
          // Fallback to the basic user data passed as prop
          setFormData({
            username: user.username,
            email: user.email,
            role: user.role === 'admin' ? 'staff' : user.role,
            isActive: user.isActive,
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            phoneNumber: '',
            occupation: '',
            street: '',
            province: '',
            city: '',
            zipCode: '',
            roomNumber: '',
            monthlyRent: '',
            securityDeposit: '',
            idType: 'passport',
            idNumber: '',
            emergencyContactName: '',
            emergencyContactRelationship: '',
            emergencyContactPhone: '',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchUserDetails();
    }
    setError(null);
    setSuccess(null);
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleRoleChange = (role: 'staff' | 'tenant') => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const validateForm = (): string | null => {
    // Common validations
    if (!formData.username.trim()) return 'Username is required';
    if (formData.username.length < 3 || formData.username.length > 30) {
      return 'Username must be between 3 and 30 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please provide a valid email address';
    }

    if (formData.role === 'tenant') {
      // Tenant-specific validations
      if (!formData.firstName.trim()) return 'First name is required';
      if (formData.firstName.length > 50) return 'First name must be less than 50 characters';
      if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) {
        return 'First name can only contain letters, spaces, hyphens, and apostrophes';
      }
      
      if (!formData.lastName.trim()) return 'Last name is required';
      if (formData.lastName.length > 50) return 'Last name must be less than 50 characters';
      if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) {
        return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
      }
      
      if (!formData.phoneNumber.trim()) return 'Phone number is required';
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber)) {
        return 'Please provide a valid phone number';
      }
      
      if (!formData.dateOfBirth) return 'Date of birth is required';
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        return 'Date of birth must be in the past';
      }
      
      if (!formData.idType) return 'ID type is required';
      if (!['passport', 'drivers_license', 'national_id', 'other'].includes(formData.idType)) {
        return 'ID type must be passport, drivers_license, national_id, or other';
      }
      
      if (!formData.idNumber.trim()) return 'ID number is required';
      if (formData.idNumber.length > 50) return 'ID number must be less than 50 characters';
      
      if (!formData.emergencyContactName.trim()) return 'Emergency contact name is required';
      if (formData.emergencyContactName.length > 100) return 'Emergency contact name must be less than 100 characters';
      
      if (!formData.emergencyContactRelationship.trim()) return 'Emergency contact relationship is required';
      if (formData.emergencyContactRelationship.length > 50) return 'Emergency contact relationship must be less than 50 characters';
      
      if (!formData.emergencyContactPhone.trim()) return 'Emergency contact phone is required';
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.emergencyContactPhone)) {
        return 'Please provide a valid emergency contact phone number';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('No user selected for editing');
      return;
    }

    // Get the user ID (handle both _id and id properties)
    const userId = user._id || (user as any).id;
    if (!userId) {
      setError('Invalid user ID');
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
      // Call API to update user
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive
      };

      // Add tenant-specific fields if role is tenant
      if (formData.role === 'tenant') {
        updateData.firstName = formData.firstName;
        updateData.lastName = formData.lastName;
        updateData.phoneNumber = formData.phoneNumber;
        updateData.dateOfBirth = formData.dateOfBirth;
        updateData.idType = formData.idType;
        updateData.idNumber = formData.idNumber;
        updateData.occupation = formData.occupation;
        updateData.street = formData.street;
        updateData.province = formData.province;
        updateData.city = formData.city;
        updateData.zipCode = formData.zipCode;
        updateData.roomNumber = formData.roomNumber;
        updateData.monthlyRent = formData.monthlyRent ? parseFloat(formData.monthlyRent) : undefined;
        updateData.securityDeposit = formData.securityDeposit ? parseFloat(formData.securityDeposit) : undefined;
        updateData.emergencyContact = {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phoneNumber: formData.emergencyContactPhone
        };
      }

      const response = await apiService.updateUser(userId, updateData);

      if (response.success) {
        setSuccess('User updated successfully!');
        onUserUpdated();
        
        // Close modal after successful update
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.message || 'Failed to update user');
      }

    } catch (error: any) {
      setError(error.message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update user information for {user.username}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mx-6">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Form */}
        {isLoading ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading user details...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* User Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">User Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleChange('tenant')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    formData.role === 'tenant'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Tenant
                </button>
                {currentUserRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => handleRoleChange('staff')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      formData.role === 'staff'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Staff
                  </button>
                )}
              </div>
            </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter First Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={formData.role === 'tenant'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter Last Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={formData.role === 'tenant'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="user@boarding.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter Username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {formData.role === 'tenant' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+63 (9xxx-xxx-xxxx)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="Person's Profession"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* Account Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Account is active
              </label>
            </div>
          </div>

          {/* Address Information - Only for tenants */}
          {formData.role === 'tenant' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Address Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="123 Main St."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Pangasinan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Dagupan City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tenant-specific fields */}
          {formData.role === 'tenant' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Tenant Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    placeholder="101"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent</label>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleInputChange}
                    placeholder="500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleInputChange}
                    placeholder="200"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  placeholder="P123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Emergency Contact</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleInputChange}
                      placeholder="Sister"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    placeholder="+63 (9xxx-xxx-xxxx)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default EditUserModal;