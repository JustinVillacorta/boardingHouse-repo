import React, { useState, useEffect } from 'react'; // Add useEffect
import { useNavigate, useLocation  } from 'react-router-dom';
import { 
  Search,
  Plus, 
  User, 
  SquarePen,
  LayoutDashboard,
  DoorOpen,
  PhilippinePeso,
  Wrench,
  BellDot,
  LogOut,
  Bell,
  X // Add X icon for closing modal
} from 'lucide-react';

// Update interface to include availability status
interface RoomData {
  _id: string;
  id: number;
  rooms: string;
  name: string;
  rent: string;
  roomType: string;
  availabilityStatus: string;    // NEW: Availability status field
  startDate: string;
  endDate: string;
  hasVehicle: boolean;
  timestamp: string;
}

/* -------------------- TOP NAVBAR -------------------- */
const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "Need Better Notifications Design" },
    { id: 2, text: "Make the Website Responsive" },
    { id: 3, text: "Fix Bug of Able to go Back to a Page" },
  ];

  return (
    <header className="bg-blue-50 shadow-sm border-b border-gray-200 px-4 lg:px-6 py-9 relative">
      <div className="flex items-center justify-between h-10">
        {/* Left: Logo/Title */}
        <div
          onClick={() => navigate("/main")}
          className="cursor-pointer flex flex-col items-start ml-5">
          <h1 className="ml-2 text-3xl font-semibold text-gray-800">
            Rooms
          </h1>
          <p className="ml-2 text-sm text-gray-400">
            Manage house rooms
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="pl-10 pr-4 py-2 w-[500px] border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 relative -ml-2"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Notifications
                  </h3>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((note, idx) => (
                    <li
                      key={note.id}
                      className="px-4 py-4 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {note.text}
                      {idx < notifications.length - 1 && (
                        <hr className="mt-4 border-gray-200" />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="p-3 border-t border-gray-200 text-center">
                  <button className="text-blue-600 text-sm font-medium hover:underline">
                    View All
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

/* -------------------- SIDEBAR -------------------- */
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    setShowLogoutConfirm(false);
    navigate("/sign-in");
  };

  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/main" },
    { name: "Users", icon: User, path: "/main-projects" },
    { name: "Rooms", icon: DoorOpen, path: "/rooms" },
    { name: "Payment", icon: PhilippinePeso, path: "/payments" },
    { name: "Reports", icon: Wrench, path: "/reports" },
    { name: "Notifications", icon: BellDot, path: "/notifications" },
    { name: "Logout", icon: LogOut, action: () => setShowLogoutConfirm(true) },
  ];

  const checkIsActive = (itemPath?: string) =>
    itemPath ? location.pathname === itemPath : false;

  return (
    <>
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50">
        <div className="p-6 border-b border-gray-200">
          {/* Logo + Text */}
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="50"
              viewBox="0 0 98 78"
              fill="none"
            >
              <g mask="url(#mask0)">
                <path
                  d="M70.7867 0H26.5453L0.402677 27.4517L9.65315 26.9134V56.6976L2.61475 57.4153C2.61475 57.4153 -0.803907 57.9535 0.00048206 61.1831C0.804871 63.5156 3.41914 63.5156 3.41914 63.5156L9.65315 62.6185V70.5131L53.6935 77.69L88.2822 70.6926V27.6311L97.7338 26.9134C97.5327 26.734 70.7867 0 70.7867 0ZM61.7374 32.6549L71.39 31.7578V43.0615L61.7374 44.138V32.6549ZM12.8707 68.5395V62.2597L31.975 59.3889C31.975 59.3889 35.1925 59.3889 34.9914 56.1593C34.7903 53.2885 31.1706 53.8268 31.1706 53.8268L12.8707 56.3387V26.0163L32.176 5.74153L53.6935 26.9134V74.9987L12.8707 68.5395ZM61.7374 59.5683V47.9059L71.39 46.8293V58.133L61.7374 59.5683ZM83.2548 56.1593L75.2109 57.4153V46.2911L83.2548 45.2145V56.1593ZM75.412 42.7026V31.5784L83.4559 30.8607V41.8055C83.2548 41.8055 75.412 42.7026 75.412 42.7026ZM41.2254 27.8105C39.0134 25.478 35.9969 24.0426 32.5782 24.0426H31.975C28.5563 24.2221 25.7409 25.8369 23.73 28.1694C21.719 30.5019 20.5124 33.7315 20.5124 37.1405V38.0376C20.7135 41.6261 22.1212 44.8557 24.3333 47.0088C26.5453 49.3412 29.5618 50.7766 32.9804 50.7766H33.5837C37.0024 50.5972 39.8177 48.9824 41.8287 46.6499C43.8397 44.3174 45.0463 41.0878 45.0463 37.6788V36.7817C44.8452 33.3726 43.4375 30.143 41.2254 27.8105ZM39.8177 45.3939C38.209 47.3676 35.7958 48.6236 33.3826 48.6236H32.9804C30.3662 48.6236 27.953 47.547 26.1431 45.5734C24.3333 43.5997 22.9256 40.9084 22.9256 37.8582V37.1405C22.9256 34.0903 23.9311 31.399 25.7409 29.4253C27.3497 27.4517 29.7629 26.1957 32.176 26.1957H32.5782C35.1925 26.1957 37.6057 27.2723 39.4156 29.2459C41.2254 31.2196 42.6331 33.9109 42.6331 36.9611V37.6788C42.6331 40.729 41.6276 43.4203 39.8177 45.3939ZM28.5563 37.6788C28.3552 33.9109 29.7629 30.5019 31.7739 29.2459C28.1541 29.4253 25.3387 33.3726 25.7409 37.8582C25.942 42.5232 29.1596 46.1116 32.7793 45.9322C30.5673 44.8557 28.7574 41.6261 28.5563 37.6788Z"
                  fill="#116DB3"
                />
              </g>
            </svg>

            <span className="text-xl font-semibold text-gray-800">
              BoarderMate
            </span>
          </div>

          {/* User Profile - below logo */}
          <div className="mt-4 flex items-center justify-center mr-12 gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
              KA
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 text-center">
                Keith Ardee Lazo
              </p>
              <div className="flex items-center justify-center gap-1 text-sm text-black-700 bg-gray-300 px-3 py-1 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-shield"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"
                  fill="#c62525ff" />
                </svg>
                <div className="text-s text-medium font-semibold">
                  <span>Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="mt-6">
          {navigationItems.map((item) => {
            const active = checkIsActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => (item.action ? item.action() : navigate(item.path!))}
                className={`flex items-center px-6 py-3 w-full text-left transition-colors ${
                  active
                    ? "bg-blue-50 border-r-4 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Add Room Modal Component
const AddRoomModal: React.FC<{ isOpen: boolean; onClose: () => void; onRoomAdded: () => void }> = ({ 
  isOpen, 
  onClose, 
  onRoomAdded 
}) => {
  const [formData, setFormData] = useState({
    roomAssignment: '',
    tenantName: '',        
    monthlyRent: '',
    roomType: 'Single',
    availabilityStatus: 'Vacant',    // NEW: Availability status field
    leaseStartDate: '',
    leaseEndDate: '',
    hasVehicle: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data to send to backend
    const dataToSend = {
      roomAssignment: formData.roomAssignment,
      tenantName: formData.tenantName,     
      monthlyRent: formData.monthlyRent,
      roomType: formData.roomType,
      availabilityStatus: formData.availabilityStatus,  // NEW: Include availability status
      leaseStartDate: formData.leaseStartDate,
      leaseEndDate: formData.leaseEndDate,
      hasVehicle: formData.hasVehicle
    };

    console.log('📤 Sending data to backend:', dataToSend);
    
    try {
      const response = await fetch('http://localhost:5000/api/add-hello', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      console.log('📥 Response from backend:', data);
      
      if (data.success) {
        alert(`✅ ${data.message}\n\nRoom Details:\n- Tenant: ${data.data.name}\n- Room: ${data.data.rooms}\n- Type: ${data.data.roomType}\n- Status: ${data.data.availabilityStatus}\n- Rent: ₱${data.data.rent}\n- Start: ${data.data.startDate}\n- End: ${data.data.endDate}\n- Vehicle: ${formData.hasVehicle ? 'Yes' : 'No'}`);
        
        // Reset form and close modal
        setFormData({
          roomAssignment: '',
          tenantName: '',        
          monthlyRent: '',
          roomType: 'Single',
          availabilityStatus: 'Vacant',    // NEW: Reset availability status
          leaseStartDate: '',
          leaseEndDate: '',
          hasVehicle: false
        });
        
        // Refresh the room data
        onRoomAdded();
        onClose();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      alert('❌ Failed to connect to server');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Room Assignment and Lease</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Room Assignment and Tenant Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Assignment
              </label>
              <select
                name="roomAssignment"
                value={formData.roomAssignment}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
              >
                <option value="">Select Available Room</option>
                <option value="Room 302">Room 302</option>
                <option value="Room 115">Room 115</option>
                <option value="Room 82">Room 82</option>
                <option value="Room 116">Room 116</option>
                <option value="Room 305">Room 305</option>
                <option value="Room 273">Room 273</option>
              </select>
            </div>

            {/* Tenant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant Name/s
              </label>
              <input
                type="text"
                name="tenantName"
                value={formData.tenantName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John Doe"
                required
              />
            </div>
          </div>

          {/* Monthly Rent and Room Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent (₱)
              </label>
              <input
                type="number"
                name="monthlyRent"
                value={formData.monthlyRent}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5800"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
              </select>
            </div>
          </div>

          {/* NEW: Availability Status and Lease Start Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NEW: Availability Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability Status
              </label>
              <select
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
              >
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
              </select>
            </div>

            {/* Lease Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lease Start Date
              </label>
              <input
                type="date"
                name="leaseStartDate"
                value={formData.leaseStartDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Lease End Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lease End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lease End Date
              </label>
              <input
                type="date"
                name="leaseEndDate"
                value={formData.leaseEndDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div></div> {/* Empty div for spacing */}
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="hasVehicle"
                  checked={formData.hasVehicle}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Has vehicle requiring parking</span>
              </label>
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors bg-red-100"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update the main Rooms component
const Rooms: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomData, setRoomData] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch room data from database
  const fetchRoomData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching room data from database...');
      
      const response = await fetch('http://localhost:5000/api/rooms');
      const data = await response.json();
      
      console.log('📥 Fetched data:', data);
      
      if (data.success) {
        setRoomData(data.data);
        setError(null);
      } else {
        setError('Failed to fetch room data');
        console.error('❌ API Error:', data);
      }
    } catch (err) {
      setError('Network error - Could not connect to server');
      console.error('❌ Network Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchRoomData();
  }, []);

  const handleAddRoomClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-64">
        <TopNavbar />
        
        <div className="w-full p-6"> 
          <div className="flex items-center justify-between mb-4">
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700"
              onClick={handleAddRoomClick}
            >
              <Plus className="w-4 h-4"/>
              Add Room
            </button>
            
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={fetchRoomData}
            >
              🔄 Refresh Data
            </button>
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-6">
            <div className="flex items-center justify-between mb-6 w-full">
              <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                
                {/* Table Header */}
                <div className="grid grid-cols-7 font-semibold text-gray-700 border-b pb-2 mb-4 text-center">
                  <span>Name</span>
                  <span>Room Number</span>
                  <span>Room Type</span>
                  <span>Availability Status</span>
                  <span>Monthly Rent (₱)</span>
                  <span>Start Date</span>
                  <span>Actions</span>
                </div>

                {/* Table Content */}
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading room data...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">❌ {error}</p>
                      <button 
                        onClick={fetchRoomData}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : roomData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No room data found. Add your first room!</p>
                    </div>
                  ) : (
                    roomData.map((room) => {
                      return (
                        <div
                          key={room._id}
                          className="grid grid-cols-7 items-center py-2 border-b last:border-b-0 font-semibold text-gray-800"
                        >
                          <span className="text-center">{room.name}</span>
                          <span className="text-center">{room.rooms}</span>
                          <span className="text-center">{room.roomType || 'Single'}</span>
                          <span className="text-center">
                            <span className={`w-24 text-center inline-block px-2 py-1 rounded-full text-sm font-semibold ${
                                  room.availabilityStatus === "Vacant"    // NEW: Use actual availability status from database
                                    ? "bg-yellow-200 text-black"
                                    : "bg-green-200 text-black"
                                }`} 
                            >
                              {room.availabilityStatus || 'Vacant'}  {/* NEW: Display actual status */}
                            </span>
                          </span>
                          <span className="text-center">₱{room.rent}</span>
                          <span className="text-center">{room.startDate}</span>
                          <span className="flex justify-center">
                            <button>
                              <SquarePen className="w-5 h-5 text-black hover:text-gray-600" />
                            </button>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {/* Database Info */}
                {roomData.length > 0 && (
                  <div className="mt-4 text-sm text-gray-500 text-center">
                    📊 Showing {roomData.length} room(s) from MongoDB • Database: boardmate • Collection: rooms_management
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Add Room Modal */}
      <AddRoomModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onRoomAdded={fetchRoomData}
      />
    </div>
  );
};

export default Rooms;