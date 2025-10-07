import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    <Router>
      <Routes>
        {/* Root path shows Sign In */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/sign-in" element={<SignIn />} />
        
        {/* Fallback: redirect unknown paths to root */}
        <Route path="/main" element={<MainFrame />} />
        <Route path="/main-projects" element={<MainProjects />} />
        <Route path="/assign-task" element={<AssignTask />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/work-logs" element={<WorkLogs/>}/>
        <Route path="/performance" element={<Performance />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Tenant routes */}
        <Route path="/tenant" element={<TenantFrame />} />

        {/* Staff routes */}
        <Route path="/staff" element={<StaffFrame />} />
        
        <Route path="*" element={<Navigate to="/signIn" replace />} />
      </Routes>
    </Router>
  );
};

export default App;