import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from "./view_pages/manager/signIn";

{/*Admin Path*/}
import MainFrame from './view_pages/manager/mainFrame'; 
import MainProjects from './view_pages/manager/users_main'; 
import Rooms from './view_pages/manager/rooms'; 
import Payment from './view_pages/manager/payment';
import PaymentInfo from './view_pages/manager/paymentMoreInfo';
import Report from './view_pages/manager/reports'; 
import Notifications from './view_pages/manager/notifications'; 
import Settings from './view_pages/manager/settings';

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
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/payments" element={<Payment/>}/>
        <Route path="/payment-info" element={<PaymentInfo/>}/>
        <Route path="/reports" element={<Report />} />
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