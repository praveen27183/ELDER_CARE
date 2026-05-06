import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';

import ElderHome from './pages/elder/ElderHome';
import ElderDashboard from './pages/elder/ElderDashboard.tsx';
import ElderLayout from './pages/elder/ElderLayout';
import ProfilePage from './pages/elder/ProfilePage';
import Bookings from './pages/elder/Bookings';
import CallSupportPage from './pages/elder/CallSupportPage';
import Help from './pages/elder/Help';
import GroceriesPage from './pages/elder/GroceriesPage';
import HouseHelpPage from './pages/elder/HouseHelpPage';
import MedicinesPage from './pages/elder/MedicinesPage';
import Membership from './pages/elder/Membership';
import Payment from './pages/elder/Payment';
import Rewards from './pages/elder/Rewards';
import Safety from './pages/elder/Safety';
import TransportPage from './pages/elder/TransportPage';
import FamilySupport from './pages/elder/familysupport';
import SOSPage from './pages/elder/SOSPage';

import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import VolunteerLayout from './pages/volunteer/components/VolunteerLayout';
import VolunteerMap from './pages/volunteer/VolunteerMap';
import VolunteerRequests from './pages/volunteer/VolunteerRequests';
import VolunteerHistory from './pages/volunteer/VolunteerHistory';
import VolunteerEarnings from './pages/volunteer/VolunteerEarnings';
import VolunteerEmergency from './pages/volunteer/VolunteerEmergency';
import VolunteerProfile from './pages/volunteer/VolunteerProfile';
import VolunteerSupport from './pages/volunteer/VolunteerSupport';
import { DutyProvider } from './pages/volunteer/context/DutyContext';

import AdminLayout from './pages/admin/admin/components/AdminLayout';
import AdminDashboard from './pages/admin/admin/AdminDashboard';
import AdminHelpCenter from './pages/admin/admin/AdminHelpCenter';
import JobAssignment from './pages/admin/admin/JobAssignment';
import VolunteerManagement from './pages/admin/admin/VolunteerManagement';
import ElderMembership from './pages/admin/admin/ElderMembership';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/elder" element={<ElderLayout><ElderHome /></ElderLayout>} />
        <Route path="/elder/dashboard" element={<ElderLayout><ElderDashboard /></ElderLayout>} />
        <Route path="/elder/profile" element={<ElderLayout><ProfilePage /></ElderLayout>} />
        <Route path="/elder/bookings" element={<ElderLayout><Bookings /></ElderLayout>} />
        <Route path="/elder/call-support" element={<ElderLayout><CallSupportPage /></ElderLayout>} />
        <Route path="/elder/help" element={<ElderLayout><Help /></ElderLayout>} />
        <Route path="/elder/groceries" element={<ElderLayout><GroceriesPage /></ElderLayout>} />
        <Route path="/elder/house-help" element={<ElderLayout><HouseHelpPage /></ElderLayout>} />
        <Route path="/elder/medicines" element={<ElderLayout><MedicinesPage /></ElderLayout>} />
        <Route path="/elder/membership" element={<ElderLayout><Membership /></ElderLayout>} />
        <Route path="/elder/payment" element={<ElderLayout><Payment /></ElderLayout>} />
        <Route path="/elder/rewards" element={<ElderLayout><Rewards /></ElderLayout>} />
        <Route path="/elder/safety" element={<ElderLayout><Safety /></ElderLayout>} />
        <Route path="/elder/transport" element={<ElderLayout><TransportPage /></ElderLayout>} />
        <Route path="/elder/family-support" element={<ElderLayout><FamilySupport /></ElderLayout>} />
        <Route path="/elder/sos" element={<ElderLayout><SOSPage /></ElderLayout>} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="jobs" element={<JobAssignment />} />
          <Route path="volunteers" element={<VolunteerManagement />} />
          <Route path="membership" element={<ElderMembership />} />
          <Route path="support" element={<AdminHelpCenter />} />
        </Route>

        <Route path="/volunteer" element={
          <DutyProvider>
            <VolunteerLayout />
          </DutyProvider>
        }>
          <Route index element={<VolunteerDashboard />} />
          <Route path="map" element={<VolunteerMap />} />
          <Route path="requests" element={<VolunteerRequests />} />
          <Route path="history" element={<VolunteerHistory />} />
          <Route path="earnings" element={<VolunteerEarnings />} />
          <Route path="emergency" element={<VolunteerEmergency />} />
          <Route path="profile" element={<VolunteerProfile />} />
          <Route path="support" element={<VolunteerSupport />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
