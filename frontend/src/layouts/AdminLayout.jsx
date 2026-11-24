
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './AdminLayout.css';

function AdminLayout() {
    const token = localStorage.getItem('adminToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="admin-layout">
            <Sidebar />

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
