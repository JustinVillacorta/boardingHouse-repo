import React from "react";
import { Users } from "lucide-react";

interface AddUserProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  onClear: () => void;
  userType: string;
  setUserType: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  birthDate: string;
  setBirthDate: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  occupation: string;
  setOccupation: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  street: string;
  setStreet: (value: string) => void;
  province: string;
  setProvince: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  zipCode: string;
  setZipCode: (value: string) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddUser: React.FC<AddUserProps> = ({
  show,
  onClose,
  onSave,
  onClear,
  userType,
  setUserType,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  birthDate,
  setBirthDate,
  phone,
  email,
  setEmail,
  occupation,
  setOccupation,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  street,
  setStreet,
  province,
  setProvince,
  city,
  setCity,
  zipCode,
  setZipCode,
  handlePhoneChange,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[999] animate-fadeIn">
      <div className="bg-white rounded-xl shadow-lg w-[800px] max-w-2xl max-h-[90vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">
            Create New User Account
          </h3>
          <button
            onClick={() => {
               onClear(); // 🧹 clear all input fields
               onClose(); // ❌ close modal
            }}
            className="text-gray-500 hover:text-black text-xl"
            >
            ✕
            </button>
         </div>

        <p className="text-xs font-semibold text-gray-500 mb-6">
          Add a new user to the boarding house management system. Complete all
          required information below.
        </p>

        {/* User Type */}
        <h2 className="text-sm font-semibold text-gray-800 mb-1">User Type</h2>
        <div className="flex items-center gap-2 mb-4">
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-1/2 bg-gray-200 p-2 border text-black rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select User Type</option>
            <option value="tenant">👥 Tenant</option>
            <option value="staff">🧑‍💼 Staff</option>
            <option value="admin">⭐ Admin</option>
          </select>

          {/* User Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center gap-1 text-xs text-black bg-gray-200 px-4 py-1 rounded-md">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="font-semibold capitalize">
                {userType || "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Personal Information
        </h3>

        {/* Name Row */}
        <div className="flex justify-center items-start gap-10 mb-4">
          {/* First Name */}
          <div className="flex flex-col flex-1">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter First Name"
              className="bg-gray-200 p-2 border text-black rounded-lg placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col flex-1">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter Last Name"
              className="bg-gray-200 p-2 border text-black rounded-lg placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Birth + Phone */}
        <div className="flex justify-center items-start gap-10 mb-4">
          <div className="flex flex-col flex-1">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-gray-200 p-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col flex-1">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              Phone Number
            </label>
            <div className="flex items-center bg-gray-200 rounded-lg border focus-within:ring-2 focus-within:ring-blue-400">
              <span className="pl-2 text-black">+63</span>
              <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="9xxxxxxxxx"
                className="flex-1 bg-gray-200 p-2 pl-2 text-black rounded-lg placeholder:text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Email + Occupation */}
        <div className="flex justify-center items-start gap-10 mb-4">
          <div className="flex flex-col flex-1">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              Email Address
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenant@boarding.com"
              className="bg-gray-200 p-2 border text-black rounded-lg placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col flex-1">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              Occupation
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Person’s Profession"
              className="bg-gray-200 p-2 border text-black rounded-lg placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="flex flex-col items-start gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              Enter Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-[285px] bg-gray-200 p-2 border text-black rounded-lg placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-[285px] bg-gray-200 p-2 border text-black rounded-lg placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Address Section */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Address Information
        </h3>

        {/* Street + Province */}
        <div className="flex justify-center items-start gap-10 mb-4">
          <div className="flex flex-col flex-1">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              Street
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Enter your Street"
              className="bg-gray-200 p-2 border text-black rounded-lg placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col flex-1">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              Province
            </label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="Enter your Province"
              className="bg-gray-200 p-2 border text-black rounded-lg placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* City + Zip + Buttons */}
        <div className="flex flex-col items-start gap-4 w-full">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-800 mb-1">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your City"
              className="w-[275px] bg-gray-200 p-2 border text-black rounded-lg placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex items-end justify-between w-full">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-800 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter your Zip Code"
                className="w-[275px] bg-gray-200 p-2 border text-black rounded-lg placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 mb-[2px]">
              <button
                type="button"
                onClick={onClear}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={onSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
