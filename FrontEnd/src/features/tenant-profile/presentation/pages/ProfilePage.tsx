import React from "react";
import ContactInfoSection from "../components/ContactInfoSection";
import SecuritySection from "../components/SecuritySection";
import TenancyInfoSection from "../components/TenancyInfoSection";
import { useTenantProfile } from "../hooks/useTenantProfile";

const ProfilePage: React.FC = () => {
  const { 
    profile, 
    loading, 
    error, 
    isUpdatingContact, 
    isUpdatingPassword,
    updateContactInfo, 
    updatePassword, 
    refresh 
  } = useTenantProfile();

  if (loading) {
    return (
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading profile
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={refresh}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="text-center">
          <p className="text-gray-500">No profile data available</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <ContactInfoSection
              contactInfo={profile.contactInfo}
              onUpdate={updateContactInfo}
              isUpdating={isUpdatingContact}
            />

            {/* Security & Privacy */}
            <SecuritySection
              onUpdatePassword={updatePassword}
              isUpdating={isUpdatingPassword}
            />
          </div>

          {/* Tenancy Information - Full Width */}
          <div className="mt-6">
            <TenancyInfoSection tenancyInfo={profile.tenancyInfo} />
          </div>
        </div>
    </main>
  );
};

export default ProfilePage;
