
import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('accessToken');

                const response = await axios.get(
                    'http://localhost:3000/api/admin/users',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUsers(response.data.data);

            } catch (error) {
                setMessage(
                    error.response?.data?.message || 'Failed to fetch users'
                );
            }
        };

        fetchUsers();
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <h2>Registered Gym Members</h2>

            {message && <p>{message}</p>}

            <table border="1" cellPadding="10">
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

            {users.length === 0 && !message && (
                <p>No registered users found.</p>
            )}
        </div>
    );
}

export default Dashboard;
