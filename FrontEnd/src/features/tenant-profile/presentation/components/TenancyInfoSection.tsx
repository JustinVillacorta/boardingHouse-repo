import React from "react";
import { Home, Calendar, DollarSign, CheckCircle } from "lucide-react";
import type { TenancyInfo } from "../../domain/entities/TenantProfile";

interface TenancyInfoSectionProps {
  tenancyInfo: TenancyInfo;
}

const TenancyInfoSection: React.FC<TenancyInfoSectionProps> = ({ tenancyInfo }) => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Tenancy Information</h2>
        <p className="text-sm text-gray-500">Your current lease details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Room Number</p>
              <p className="text-lg font-semibold text-gray-900">{tenancyInfo.roomNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Room Type</p>
              <p className="text-lg font-semibold text-gray-900">{tenancyInfo.roomType}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Rent</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(tenancyInfo.monthlyRent)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Lease Start Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(tenancyInfo.leaseStartDate)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Account Status</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(tenancyInfo.accountStatus)}`}>
                {tenancyInfo.accountStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenancyInfoSection;
