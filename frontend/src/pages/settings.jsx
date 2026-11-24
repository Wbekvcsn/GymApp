
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserRound,
    Building2,
    LockKeyhole,
    Save
} from 'lucide-react';
import API from '../services/api';
import './settings.css';

function Settings() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile');

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [gym, setGym] = useState({
        gymName: '',
        gymAddress: ''
    });

    const [password, setPassword] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const response = await API.get('/admin/profile');
                const admin = response.data.data;

                setProfile({
                    name: admin.name || '',
                    email: admin.email || '',
                    phone: admin.phone || ''
                });

                setGym({
                    gymName: admin.gymName || '',
                    gymAddress: admin.gymAddress || ''
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Unable to fetch admin profile'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAdminProfile();
    }, []);

    const handleProfileChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const handleGymChange = (e) => {
        setGym({
            ...gym,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPassword({
            ...password,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const response = await API.put('/admin/profile', profile);
            setMessage(response.data.message);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to update profile'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleGymSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const response = await API.put('/admin/profile', gym);
            setMessage(response.data.message);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to update gym details'
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        if (password.newPassword !== password.confirmPassword) {
            setError('New password and confirm password do not match');
            setSaving(false);
            return;
        }

        try {
            const response = await API.put(
                '/admin/change-password',
                password
            );

            setMessage(response.data.message);

            setPassword({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Clear the old access token
            localStorage.removeItem('adminToken');

            // Redirect to login after successful password change
            navigate('/login', {
                replace: true
            });

        } catch (err) {
            const responseErrors = err.response?.data?.errors;

            setError(
                responseErrors?.[0]?.msg ||
                err.response?.data?.message ||
                'Unable to change password'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setMessage('');
        setError('');
    };

    if (loading) {
        return <div className="settings-page">Loading settings...</div>;
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your admin account and gym information.</p>
                </div>
            </div>

            {message && (
                <p style={{ color: 'green' }}>{message}</p>
            )}

            {error && (
                <p style={{ color: 'red' }}>{error}</p>
            )}

            <div className="settings-layout">
                <div className="settings-sidebar">
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => handleTabChange('profile')}
                    >
                        <UserRound size={18} />
                        Admin Profile
                    </button>

                    <button
                        className={activeTab === 'gym' ? 'active' : ''}
                        onClick={() => handleTabChange('gym')}
                    >
                        <Building2 size={18} />
                        Gym Details
                    </button>

                    <button
                        className={activeTab === 'password' ? 'active' : ''}
                        onClick={() => handleTabChange('password')}
                    >
                        <LockKeyhole size={18} />
                        Change Password
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSave}>
                            <h2>Admin Profile</h2>
                            <p>Update your personal information.</p>

                            <label>Full Name</label>
                            <input
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                placeholder="Enter your name"
                                required
                            />

                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                placeholder="Enter your email"
                                required
                            />

                            <label>Phone Number</label>
                            <input
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                placeholder="Enter your phone number"
                                required
                            />

                            <button
                                type="submit"
                                className="settings-save-btn"
                                disabled={saving}
                            >
                                <Save size={17} />
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'gym' && (
                        <form onSubmit={handleGymSave}>
                            <h2>Gym Details</h2>
                            <p>Manage your gym information.</p>

                            <label>Gym Name</label>
                            <input
                                name="gymName"
                                value={gym.gymName}
                                onChange={handleGymChange}
                                placeholder="Enter gym name"
                                required
                            />

                            <label>Gym Address</label>
                            <textarea
                                name="gymAddress"
                                value={gym.gymAddress}
                                onChange={handleGymChange}
                                placeholder="Enter gym address"
                                rows={4}
                                required
                            />

                            <button
                                type="submit"
                                className="settings-save-btn"
                                disabled={saving}
                            >
                                <Save size={17} />
                                {saving ? 'Saving...' : 'Save Gym Details'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSave}>
                            <h2>Change Password</h2>
                            <p>Update your admin account password.</p>

                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={password.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                                required
                            />

                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={password.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter new password"
                                required
                            />

                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={password.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm new password"
                                required
                            />

                            <button
                                type="submit"
                                className="settings-save-btn"
                                disabled={saving}
                            >
                                <Save size={17} />
                                {saving ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;
