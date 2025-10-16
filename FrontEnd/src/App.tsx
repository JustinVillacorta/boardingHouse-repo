import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import SignIn from "./view_pages/manager/signIn";

{/*Admin Path*/}
import MainFrame from './view_pages/manager/mainFrame'; 
import MainProjects from './view_pages/manager/users_main'; 
import AssignTask from './view_pages/manager/projectTask';  
import Rooms from './view_pages/manager/rooms'; 
import Performance from './view_pages/manager/reports'; 
import Settings from './view_pages/manager/settings';
import WorkLogs from './view_pages/manager/payment';
import Notifications from './view_pages/manager/notifications'; 

{/* Tenant Path - New Clean Architecture Implementation */}
import TenantLayout from './components/tenant/TenantLayout';
import TenantDashboardPage from './features/tenant-dashboard/presentation/pages/TenantDashboardPage';
import NotificationsPage from './features/tenant-notifications/presentation/pages/NotificationsPage';
import PaymentsPage from './features/tenant-payments/presentation/pages/PaymentsPage';
import ProfilePage from './features/tenant-profile/presentation/pages/ProfilePage';
import TenantReportsPage from './features/reports/presentation/pages/TenantReportsPage';

{/* Staff Path*/}
import StaffDashboard from './view_pages/staff/staffDashboard';
import StaffUsers from './view_pages/staff/staffUsers';
import StaffRooms from './view_pages/staff/staffRooms';
import StaffPayment from './view_pages/staff/staffPayment';
import StaffReports from './view_pages/staff/staffReports';
import StaffNotifications from './view_pages/staff/staffNotifications';


const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/sign-in" element={<SignIn />} />
          
          {/* Admin/Staff protected routes */}
          <Route path="/main" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <MainFrame />
            </ProtectedRoute>
          } />
          <Route path="/main-projects" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <MainProjects />
            </ProtectedRoute>
          } />
          <Route path="/assign-task" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <AssignTask />
            </ProtectedRoute>
          } />
          <Route path="/rooms" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <Rooms />
            </ProtectedRoute>
          } />
          <Route path="/work-logs" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <WorkLogs />
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <Performance />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <Notifications />
            </ProtectedRoute>
          } />

          {/* Tenant routes with nested routing */}
          <Route path="/tenant" element={
            <ProtectedRoute requiredRole="tenant">
              <TenantLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TenantDashboardPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<TenantReportsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Staff routes */}
          <Route path="/staff" element={<Navigate to="/staff-dashboard" replace />} />
          <Route path="/staff-dashboard" element={
            <ProtectedRoute requiredRole="staff">
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff-users" element={
            <ProtectedRoute requiredRole="staff">
              <StaffUsers />
            </ProtectedRoute>
          } />
          <Route path="/staff-rooms" element={
            <ProtectedRoute requiredRole="staff">
              <StaffRooms />
            </ProtectedRoute>
          } />
          <Route path="/staff-payment" element={
            <ProtectedRoute requiredRole="staff">
              <StaffPayment />
            </ProtectedRoute>
          } />
          <Route path="/staff-reports" element={
            <ProtectedRoute requiredRole="staff">
              <StaffReports />
            </ProtectedRoute>
          } />
          <Route path="/staff-notifications" element={
            <ProtectedRoute requiredRole="staff">
              <StaffNotifications />
            </ProtectedRoute>
          } />
          
          {/* Fallback: redirect unknown paths to sign-in */}
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;