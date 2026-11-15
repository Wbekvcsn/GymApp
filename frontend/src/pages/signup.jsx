import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        gymName: '',
        gymAddress: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'http://localhost:3000/api/admin/register',
                formData
            );

            setMessage(response.data.message);

            setTimeout(() => {
                navigate('/login');
            }, 1000);
        }
        catch (error) {
            setMessage(
                error.response?.data?.message || 'Registration failed'
            );
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card signup-card">
                <h1>Gym<span>App</span></h1>
                <h2>Create Admin Account</h2>
                <p className="auth-subtitle">Register your gym</p>

                <form onSubmit={handleSubmit}>
                    <label>Admin Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter admin name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Create password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />

                    <label>Gym Name</label>
                    <input
                        type="text"
                        name="gymName"
                        placeholder="Enter gym name"
                        value={formData.gymName}
                        onChange={handleChange}
                        required
                    />

                    <label>Gym Address</label>
                    <input
                        type="text"
                        name="gymAddress"
                        placeholder="Enter gym address"
                        value={formData.gymAddress}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">Create Account</button>
                </form>

                {message && <p className="auth-error">{message}</p>}

                <p className="auth-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;