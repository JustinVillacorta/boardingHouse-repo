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

{/* Tenant Path*/}
import TenantFrame from './view_pages/tenant/tenantFrame';

{/* Staff Path*/}
import StaffFrame from './view_pages/staff/staffFrame';


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

          {/* Tenant routes */}
          <Route path="/tenant" element={
            <ProtectedRoute requiredRole="tenant">
              <TenantFrame />
            </ProtectedRoute>
          } />

          {/* Staff routes */}
          <Route path="/staff" element={
            <ProtectedRoute requiredRole="staff">
              <StaffFrame />
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