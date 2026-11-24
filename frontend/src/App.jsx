
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Signup from './pages/signup';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import AdminLayout from './layouts/AdminLayout';
import Payments from './pages/payments';
import MembershipPlans from './pages/membershipPlans';
import Members from './pages/members';
import Settings from './pages/settings';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />

                <Route element={<AdminLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/members" element={< Members />} />
                    <Route path="/membership-plans" element={<MembershipPlans />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/settings" element={< Settings />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
