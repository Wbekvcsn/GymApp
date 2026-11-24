
import { useEffect, useState } from 'react';
import {
    Users,
    UserCheck,
    CreditCard,
    Dumbbell,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react';

import API from '../services/api';
import './dashboard.css';

function Dashboard() {
    // Dashboard statistics
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Recent members
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [membersError, setMembersError] = useState('');

    // Payment statistics
    const [paymentStats, setPaymentStats] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(true);
    const [paymentError, setPaymentError] = useState('');

    // Fetch dashboard statistics
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await API.get('/admin/dashboard-stats');

                setDashboardStats(response.data.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Failed to fetch dashboard statistics'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    // Fetch recent members
    useEffect(() => {
        const fetchRecentMembers = async () => {
            try {
                const response = await API.get('/admin/recent-users');

                setMembers(response.data.data);
            } catch (err) {
                setMembersError(
                    err.response?.data?.message ||
                    'Failed to fetch recent members'
                );
            } finally {
                setMembersLoading(false);
            }
        };

        fetchRecentMembers();
    }, []);

    // Fetch payment statistics
    useEffect(() => {
        const fetchPaymentStats = async () => {
            try {
                const response = await API.get('/admin/payment-stats');

                setPaymentStats(response.data.data);
            } catch (err) {
                setPaymentError(
                    err.response?.data?.message ||
                    'Failed to fetch payment statistics'
                );
            } finally {
                setPaymentLoading(false);
            }
        };

        fetchPaymentStats();
    }, []);

    // Monthly revenue for January to December of current year
    const currentYear = new Date().getFullYear();

    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyRevenue = monthNames.map((month, index) => {
        const monthData = paymentStats?.monthlyRevenue?.find(
            (item) =>
                item._id.year === currentYear &&
                item._id.month === index + 1
        );

        return {
            month,
            revenue: monthData?.revenue || 0
        };
    });

    // Find the highest monthly revenue for chart scaling
    const maxRevenue = Math.max(
        ...monthlyRevenue.map((item) => item.revenue),
        0
    );

    // Membership percentages
    const totalUsers = dashboardStats?.totalUsers || 0;

    const activePercentage = totalUsers > 0
        ? (dashboardStats?.activeMemberships / totalUsers) * 100
        : 0;

    const inactivePercentage = totalUsers > 0
        ? (dashboardStats?.inactiveMemberships / totalUsers) * 100
        : 0;

    const expiredPercentage = totalUsers > 0
        ? (dashboardStats?.expiredMemberships / totalUsers) * 100
        : 0;

    // Format date
    const today = new Date();

    const formattedDate = today.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="dashboard">

            {/* Dashboard Header */}
            <div className="dashboard-header">
                <div>
                    <p className="welcome-label">Welcome back, Admin</p>
                    <h1>Dashboard Overview</h1>
                </div>

                <div className="header-date">
                    {formattedDate}
                </div>
            </div>

            {/* Dashboard Statistics */}
            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-icon">
                            <Users size={22} />
                        </div>
                    </div>

                    <div className="stat-info">
                        <p>Total Members</p>
                        <h2>
                            {loading
                                ? 'Loading...'
                                : dashboardStats?.totalUsers ?? 0}
                        </h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-icon">
                            <UserCheck size={22} />
                        </div>
                    </div>

                    <div className="stat-info">
                        <p>Active Memberships</p>
                        <h2>
                            {loading
                                ? 'Loading...'
                                : dashboardStats?.activeMemberships ?? 0}
                        </h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-icon">
                            <Dumbbell size={22} />
                        </div>
                    </div>

                    <div className="stat-info">
                        <p>Total Plans</p>
                        <h2>
                            {loading
                                ? 'Loading...'
                                : dashboardStats?.totalPlans ?? 0}
                        </h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-icon">
                            <CreditCard size={22} />
                        </div>
                    </div>

                    <div className="stat-info">
                        <p>Active Plans</p>
                        <h2>
                            {loading
                                ? 'Loading...'
                                : dashboardStats?.activePlans ?? 0}
                        </h2>
                    </div>
                </div>

            </div>

            {error && (
                <p className="error-message">{error}</p>
            )}

            {/* Dashboard Main Content */}
            <div className="dashboard-content-grid">

                {/* Revenue Overview */}
                <div className="dashboard-panel revenue-panel">

                    <div className="panel-header">
                        <div>
                            <h2>Revenue Overview</h2>
                            <p>Monthly revenue for {currentYear}</p>
                        </div>

                        <ArrowUpRight size={20} />
                    </div>

                    <div className="revenue-highlight">
                        <h2>
                            {paymentLoading
                                ? 'Loading...'
                                : `₹${(paymentStats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
                        </h2>

                        <span>
                            <TrendingUp size={15} />

                            {paymentLoading
                                ? 'Loading payment data'
                                : `${paymentStats?.totalPayments ?? 0} successful payments`}
                        </span>
                    </div>

                    {paymentError && (
                        <p className="error-message">
                            {paymentError}
                        </p>
                    )}

                    {/* Monthly Revenue Chart */}
                    <div className="revenue-chart">

                        {monthlyRevenue.map((item, index) => {
                            const barHeight = maxRevenue > 0
                                ? (item.revenue / maxRevenue) * 100
                                : 0;

                            return (
                                <div
                                    className="chart-column"
                                    key={index}
                                    title={`${item.month}: ₹${item.revenue.toLocaleString('en-IN')}`}
                                >
                                    <div
                                        className="chart-bar"
                                        style={{
                                            height: `${barHeight}%`
                                        }}
                                    />
                                </div>
                            );
                        })}

                    </div>

                    <div className="chart-months">
                        {monthlyRevenue.map((item, index) => (
                            <span key={index}>
                                {item.month}
                            </span>
                        ))}
                    </div>

                </div>

                {/* Membership Overview */}
                <div className="dashboard-panel">

                    <div className="panel-header">
                        <div>
                            <h2>Membership Overview</h2>
                            <p>Membership status distribution</p>
                        </div>
                    </div>

                    <div className="membership-total">
                        <h2>
                            {loading
                                ? 'Loading...'
                                : dashboardStats?.totalUsers ?? 0}
                        </h2>
                        <p>Total Members</p>
                    </div>

                    <div className="membership-progress">

                        <div className="progress-bar">
                            <div
                                className="progress-active"
                                style={{
                                    width: `${activePercentage}%`
                                }}
                            />

                            <div
                                className="progress-inactive"
                                style={{
                                    width: `${inactivePercentage}%`
                                }}
                            />

                            <div
                                className="progress-expired"
                                style={{
                                    width: `${expiredPercentage}%`
                                }}
                            />
                        </div>

                    </div>

                    <div className="progress-details">

                        <div>
                            <span className="status-dot active-dot" />
                            <span>Active</span>
                            <strong>
                                {dashboardStats?.activeMemberships ?? 0}
                            </strong>
                        </div>

                        <div>
                            <span className="status-dot inactive-dot" />
                            <span>Inactive</span>
                            <strong>
                                {dashboardStats?.inactiveMemberships ?? 0}
                            </strong>
                        </div>

                        <div>
                            <span className="status-dot expired-dot" />
                            <span>Expired</span>
                            <strong>
                                {dashboardStats?.expiredMemberships ?? 0}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>

            {/* Recent Members Table */}
            <div className="dashboard-panel members-panel">

                <div className="panel-header">
                    <div>
                        <h2>Recent Members</h2>
                        <p>Latest registered gym members</p>
                    </div>
                </div>

                {membersLoading ? (
                    <p>Loading recent members...</p>
                ) : membersError ? (
                    <p className="error-message">
                        {membersError}
                    </p>
                ) : members.length === 0 ? (
                    <p>No members found.</p>
                ) : (

                    <div className="table-wrapper">

                        <table className="members-table">

                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Email</th>
                                    <th>Membership Plan</th>
                                    <th>Joined Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                {members.map((member) => (
                                    <tr key={member._id}>

                                        <td>
                                            <div className="member-details">
                                                <div className="member-avatar">
                                                    {member.firstName?.charAt(0)?.toUpperCase()}
                                                </div>

                                                <span>
                                                    {member.firstName} {member.lastName}
                                                </span>
                                            </div>
                                        </td>

                                        <td>{member.email}</td>

                                        <td>
                                            {member.membershipPlan || 'No Plan'}
                                        </td>

                                        <td>
                                            {member.createdAt
                                                ? new Date(member.createdAt).toLocaleDateString('en-IN')
                                                : 'N/A'}
                                        </td>

                                        <td>
                                            <span
                                                className={`member-status ${member.membershipStatus?.toLowerCase() || 'inactive'}`}
                                            >
                                                {member.membershipStatus || 'Inactive'}
                                            </span>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Dashboard;
