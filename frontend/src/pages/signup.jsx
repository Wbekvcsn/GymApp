
import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

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

        } catch (error) {
            setMessage(
                error.response?.data?.message || 'Registration failed'
            );
        }
    };

    return (
        <div>
            <h2>Gym Admin Signup</h2>

            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Admin Name" value={formData.name} onChange={handleChange} required />

                <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

                <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

                <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />

                <input name="gymName" placeholder="Gym Name" value={formData.gymName} onChange={handleChange} required />

                <input name="gymAddress" placeholder="Gym Address" value={formData.gymAddress} onChange={handleChange} required />

                <button type="submit">Register</button>
            </form>

            {message && <p>{message}</p>}

            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Signup;
