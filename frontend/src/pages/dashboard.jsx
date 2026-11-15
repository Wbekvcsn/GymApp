import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

function Dashboard() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('accessToken');

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(
                    'http://localhost:3000/api/admin/users',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUsers(response.data.data);
            }
            catch (error) {
                setMessage(
                    error.response?.data?.message || 'Failed to fetch users'
                );
            }
            finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <nav className="navbar">
                <h2>Gym<span>App</span></h2>
                <button onClick={handleLogout}>Logout</button>
            </nav>

            <main className="dashboard-content">
                <h1>Admin Dashboard</h1>
                <p className="subtitle">Manage your gym members</p>

                <div className="stats-card">
                    <div>
                        <p>Total Members</p>
                        <h2>{users.length}</h2>
                    </div>
                    <div className="stats-icon">👥</div>
                </div>

                <section className="members-section">
                    <h2>Registered Members</h2>

                    {loading && <p>Loading members...</p>}

                    {message && <p className="error">{message}</p>}

                    {!loading && !message && (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Membership Plan</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td>{user.firstName} {user.lastName}</td>
                                            <td>{user.email}</td>
                                            <td>{user.mobileNo}</td>
                                            <td>{user.membershipPlan || 'Not assigned'}</td>
                                            <td>{user.membershipStatus || 'Not assigned'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {users.length === 0 && (
                                <p className="empty-message">
                                    No registered members found.
                                </p>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Dashboard;