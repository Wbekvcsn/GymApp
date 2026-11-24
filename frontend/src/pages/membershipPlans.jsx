
import { useEffect, useState } from 'react';
import {
    Plus,
    Pencil,
    Power,
    RefreshCw,
    X,
    Dumbbell
} from 'lucide-react';

import API from '../services/api';
import './membershipPlans.css';

const initialForm = {
    planName: 'Monthly',
    durationDays: '',
    price: '',
    description: ''
};

function MembershipPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    // Fetch all membership plans
    const fetchPlans = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await API.get('/admin/membership-plans');
console.log('Membership Plans API Response:', response.data);
            const result = response.data.data;

            setPlans(
                Array.isArray(result)
                    ? result
                    : result?.plans || response.data.plans || []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to fetch membership plans'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // Update form fields
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Open form for adding a plan
    const handleAddPlan = () => {
        setEditingPlan(null);
        setFormData(initialForm);
        setMessage('');
        setError('');
        setShowForm(true);
    };

    // Open form for editing a plan
    const handleEditPlan = (plan) => {
        setEditingPlan(plan);

        setFormData({
            planName: plan.planName,
            durationDays: plan.durationDays,
            price: plan.price,
            description: plan.description || ''
        });

        setMessage('');
        setError('');
        setShowForm(true);
    };

    // Create or update membership plan
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setMessage('');

            const payload = {
                planName: formData.planName,
                durationDays: Number(formData.durationDays),
                price: Number(formData.price),
                description: formData.description
            };

            if (
                !payload.durationDays ||
                payload.durationDays <= 0 ||
                payload.price < 0 ||
                formData.durationDays === ''
            ) {
                setError('Enter a valid duration and price.');
                return;
            }

            if (editingPlan) {
                await API.put(
                    `/admin/membership-plan/${editingPlan._id}`,
                    payload
                );

                setMessage('Membership plan updated successfully.');
            } else {
                await API.post('/admin/membership-plan', payload);

                setMessage('Membership plan created successfully.');
            }

            setShowForm(false);
            setEditingPlan(null);
            setFormData(initialForm);

            await fetchPlans();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to save membership plan'
            );
        } finally {
            setSaving(false);
        }
    };

    // Deactivate a membership plan
    const handleDeactivate = async (plan) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate the ${plan.planName} plan?`
        );

        if (!confirmed) return;

        try {
            setError('');
            setMessage('');

            await API.delete(`/admin/membership-plan/${plan._id}`);

            setMessage(`${plan.planName} plan deactivated successfully.`);

            await fetchPlans();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to deactivate membership plan'
            );
        }
    };

    // Activate an inactive plan using the existing update API
    const handleActivate = async (plan) => {
        try {
            setError('');
            setMessage('');

            await API.put(`/admin/membership-plan/${plan._id}`, {
                isActive: true
            });

            setMessage(`${plan.planName} plan activated successfully.`);

            await fetchPlans();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to activate membership plan'
            );
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingPlan(null);
        setFormData(initialForm);
        setError('');
    };

    return (
        <div className="plans-page">

            {/* Header */}
            <div className="plans-header">
                <div>
                    <h1>Membership Plans</h1>
                    <p>Create and manage your gym membership plans.</p>
                </div>

                <div className="plans-header-actions">
                    <button
                        className="plans-refresh-btn"
                        onClick={fetchPlans}
                        disabled={loading}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    <button
                        className="add-plan-btn"
                        onClick={handleAddPlan}
                    >
                        <Plus size={18} />
                        Add New Plan
                    </button>
                </div>
            </div>

            {/* Messages */}
            {message && (
                <div className="plans-success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="plans-error-message">
                    {error}
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="plan-form-card">

                    <div className="plan-form-header">
                        <div>
                            <h2>
                                {editingPlan
                                    ? 'Edit Membership Plan'
                                    : 'Create Membership Plan'}
                            </h2>

                            <p>
                                Enter the membership plan details below.
                            </p>
                        </div>

                        <button
                            className="close-form-btn"
                            onClick={handleCancel}
                            type="button"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="plan-form-grid">

                            <div className="plan-form-group">
                                <label htmlFor="planName">
                                    Plan Name
                                </label>

                                <select
                                    id="planName"
                                    name="planName"
                                    value={formData.planName}
                                    onChange={handleChange}
                                    required
                                    disabled={Boolean(editingPlan)}
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Half-Yearly">Half-Yearly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
                            </div>

                            <div className="plan-form-group">
                                <label htmlFor="durationDays">
                                    Duration (Days)
                                </label>

                                <input
                                    id="durationDays"
                                    type="number"
                                    name="durationDays"
                                    min="1"
                                    placeholder="Example: 30"
                                    value={formData.durationDays}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="plan-form-group">
                                <label htmlFor="price">
                                    Price (₹)
                                </label>

                                <input
                                    id="price"
                                    type="number"
                                    name="price"
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter plan price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="plan-form-group">
                                <label htmlFor="description">
                                    Description
                                </label>

                                <input
                                    id="description"
                                    type="text"
                                    name="description"
                                    placeholder="Enter plan description"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                        <div className="plan-form-actions">

                            <button
                                type="button"
                                className="cancel-plan-btn"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-plan-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Saving...'
                                    : editingPlan
                                        ? 'Update Plan'
                                        : 'Create Plan'}
                            </button>

                        </div>

                    </form>

                </div>
            )}

            {/* Plans List */}
            <div className="plans-list-header">
                <div>
                    <h2>All Membership Plans</h2>
                    <p>{plans.length} plans found</p>
                </div>
            </div>

            {loading ? (
                <div className="plans-message">
                    Loading membership plans...
                </div>
            ) : plans.length === 0 ? (
                <div className="plans-message">
                    <Dumbbell size={30} />
                    <h3>No membership plans found</h3>
                    <p>Create your first membership plan to get started.</p>
                </div>
            ) : (

                <div className="plans-grid">

                    {plans.map((plan) => (
                        <div
                            className="plan-card"
                            key={plan._id}
                        >

                            <div className="plan-card-top">
                                <div className="plan-icon">
                                    <Dumbbell size={22} />
                                </div>

                                <span
                                    className={`plan-status ${
                                        plan.isActive ? 'active' : 'inactive'
                                    }`}
                                >
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <h3>{plan.planName}</h3>

                            <div className="plan-price">
                                ₹{Number(plan.price).toLocaleString('en-IN')}
                            </div>

                            <p className="plan-duration">
                                {plan.durationDays} days
                            </p>

                            <p className="plan-description">
                                {plan.description || 'No description available.'}
                            </p>

                            <div className="plan-card-actions">

                                <button
                                    className="edit-plan-btn"
                                    onClick={() => handleEditPlan(plan)}
                                >
                                    <Pencil size={15} />
                                    Edit
                                </button>

                                {plan.isActive ? (
                                    <button
                                        className="deactivate-plan-btn"
                                        onClick={() => handleDeactivate(plan)}
                                    >
                                        <Power size={15} />
                                        Deactivate
                                    </button>
                                ) : (
                                    <button
                                        className="activate-plan-btn"
                                        onClick={() => handleActivate(plan)}
                                    >
                                        <Power size={15} />
                                        Activate
                                    </button>
                                )}

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default MembershipPlans;
