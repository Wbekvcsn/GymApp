
import { NavLink, useNavigate } from 'react-router-dom';

import {
    LayoutDashboard,
    Users,
    CreditCard,
    Dumbbell,
    Settings,
    LogOut
} from 'lucide-react';

import API from '../services/api';
import './Sidebar.css';

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await API.post('/admin/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('adminToken');
            navigate('/login', { replace: true });
        }
    };

    const menuItems = [
        {
            name: 'Overview',
            path: '/dashboard',
            icon: LayoutDashboard
        },
        {
            name: 'Members',
            path: '/members',
            icon: Users
        },
        {
            name: 'Membership Plans',
            path: '/membership-plans',
            icon: Dumbbell
        },
        {
            name: 'Payments',
            path: '/payments',
            icon: CreditCard
        }
    ];

    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                <div className="brand-icon">
                    <Dumbbell size={23} />
                </div>

                <h2>
                    GYM<span>APP</span>
                </h2>
            </div>

            <div className="sidebar-section">
                <p className="sidebar-heading">MENU</p>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    isActive
                                        ? 'nav-item active'
                                        : 'nav-item'
                                }
                            >
                                <Icon size={19} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-bottom">

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive
                            ? 'nav-item active'
                            : 'nav-item'
                    }
                >
                    <Settings size={19} />
                    <span>Settings</span>
                </NavLink>

                <button
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={19} />
                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;
