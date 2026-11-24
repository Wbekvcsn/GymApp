
import { useEffect, useMemo, useState } from 'react';
import {
    Search,
    RefreshCw,
    Users,
    UserRound,
    Mail,
    Phone,
    CalendarDays,
    X,
    ChevronLeft,
    ChevronRight,
    Eye,
    Crown,
    Pencil,
    UserX,
    Save
} from 'lucide-react';

import API from '../services/api';
import './members.css';

const PAGE_SIZE = 8;

function Members() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMember, setSelectedMember] = useState(null);

    const [editingMember, setEditingMember] = useState(null);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNo: '',
        membershipPlan: 'Monthly',
        membershipStatus: 'Inactive'
    });

    const [saving, setSaving] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');

    const fetchMembers = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await API.get('/admin/users');
            const result = response.data;

            const users = Array.isArray(result)
                ? result
                : Array.isArray(result.data)
                    ? result.data
                    : Array.isArray(result.users)
                        ? result.users
                        : Array.isArray(result.data?.users)
                            ? result.data.users
                            : [];

            // Do not display soft-deleted members.
            setMembers(users.filter((member) => member.isDeleted !== true));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to fetch members'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const filteredMembers = useMemo(() => {
        return members.filter((member) => {
            const fullName = `${member.firstName || ''} ${member.lastName || ''}`;

            const searchMatch =
                fullName.toLowerCase().includes(search.toLowerCase()) ||
                (member.email || '').toLowerCase().includes(search.toLowerCase()) ||
                (member.mobileNo || '').toString().includes(search);

            const statusMatch =
                statusFilter === 'All' ||
                (member.membershipStatus || 'Inactive').toLowerCase() ===
                    statusFilter.toLowerCase();

            return searchMatch && statusMatch;
        });
    }, [members, search, statusFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredMembers.length / PAGE_SIZE)
    );

    const paginatedMembers = filteredMembers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const activeCount = members.filter(
        (member) => member.membershipStatus === 'Active'
    ).length;

    const inactiveCount = members.filter(
        (member) => member.membershipStatus === 'Inactive'
    ).length;

    const expiredCount = members.filter(
        (member) => member.membershipStatus === 'Expired'
    ).length;

    const formatDate = (date) => {
        if (!date) return '—';

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return '—';

        return parsedDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getInitials = (member) => {
        const first = member.firstName?.charAt(0) || '';
        const last = member.lastName?.charAt(0) || '';

        return `${first}${last}`.toUpperCase() || 'M';
    };

    const getFullName = (member) => {
        return `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
            'Unnamed Member';
    };

    const getStatusClass = (status) => {
        return (status || 'Inactive').toLowerCase();
    };

    const changeFilter = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const changeSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const openEditModal = (member) => {
        setEditingMember(member);
        setEditForm({
            firstName: member.firstName || '',
            lastName: member.lastName || '',
            email: member.email || '',
            mobileNo: member.mobileNo || '',
            membershipPlan: member.membershipPlan || 'Monthly',
            membershipStatus: member.membershipStatus || 'Inactive'
        });
        setActionMessage('');
        setActionError('');
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleUpdateMember = async (e) => {
        e.preventDefault();

        if (!editingMember) return;

        try {
            setSaving(true);
            setActionMessage('');
            setActionError('');

            const response = await API.put(
                `/admin/users/${editingMember._id}`,
                editForm
            );

            setActionMessage(
                response.data.message || 'Member updated successfully'
            );

            setEditingMember(null);
            await fetchMembers();
        } catch (err) {
            setActionError(
                err.response?.data?.message || 'Failed to update member'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (member) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${getFullName(member)}?`
        );

        if (!confirmed) return;

        try {
            setActionLoadingId(member._id);
            setActionMessage('');
            setActionError('');

            const response = await API.patch(
                `/admin/users/${member._id}/deactivate`
            );

            setActionMessage(
                response.data.message || 'Member deactivated successfully'
            );

            // Remove the member immediately from the visible list.
            setMembers((previous) =>
                previous.filter((item) => item._id !== member._id)
            );

            if (selectedMember?._id === member._id) {
                setSelectedMember(null);
            }

            if (editingMember?._id === member._id) {
                setEditingMember(null);
            }

            await fetchMembers();
        } catch (err) {
            setActionError(
                err.response?.data?.message || 'Failed to deactivate member'
            );
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="members-page">

            <div className="members-header">
                <div>
                    <span className="members-eyebrow">GYM MANAGEMENT</span>
                    <h1>Members</h1>
                    <p>Manage and monitor your gym members.</p>
                </div>

                <button
                    className="members-refresh"
                    onClick={fetchMembers}
                    disabled={loading}
                >
                    <RefreshCw size={17} className={loading ? 'spinning' : ''} />
                    Refresh
                </button>
            </div>

            <div className="members-stats">
                <div className="member-stat-card">
                    <div className="member-stat-icon total-icon">
                        <Users size={21} />
                    </div>
                    <div>
                        <span>Total Members</span>
                        <h2>{members.length}</h2>
                    </div>
                </div>

                <div className="member-stat-card">
                    <div className="member-stat-icon active-icon">
                        <UserRound size={21} />
                    </div>
                    <div>
                        <span>Active Members</span>
                        <h2>{activeCount}</h2>
                    </div>
                </div>

                <div className="member-stat-card">
                    <div className="member-stat-icon inactive-icon">
                        <Users size={21} />
                    </div>
                    <div>
                        <span>Inactive Members</span>
                        <h2>{inactiveCount}</h2>
                    </div>
                </div>

                <div className="member-stat-card">
                    <div className="member-stat-icon expired-icon">
                        <CalendarDays size={21} />
                    </div>
                    <div>
                        <span>Expired Members</span>
                        <h2>{expiredCount}</h2>
                    </div>
                </div>
            </div>

            <div className="members-content">

                <div className="members-toolbar">
                    <div className="members-search">
                        <Search size={19} />
                        <input
                            type="text"
                            placeholder="Search name, email or mobile..."
                            value={search}
                            onChange={(e) => changeSearch(e.target.value)}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => changeFilter(e.target.value)}
                        className="members-filter"
                    >
                        <option value="All">All Memberships</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>

                {error && (
                    <div className="members-error">{error}</div>
                )}

                {actionMessage && (
                    <div className="members-success">{actionMessage}</div>
                )}

                {actionError && (
                    <div className="members-error">{actionError}</div>
                )}

                {loading ? (
                    <div className="members-loading">
                        <RefreshCw size={25} className="spinning" />
                        <p>Loading members...</p>
                    </div>
                ) : (
                    <>
                        <div className="members-table-wrapper">
                            <table className="members-table">
                                <thead>
                                    <tr>
                                        <th>MEMBER</th>
                                        <th>CONTACT</th>
                                        <th>MEMBERSHIP PLAN</th>
                                        <th>JOINING DATE</th>
                                        <th>STATUS</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedMembers.length > 0 ? (
                                        paginatedMembers.map((member) => (
                                            <tr key={member._id}>
                                                <td>
                                                    <div className="member-identity">
                                                        <div className="member-avatar">
                                                            {getInitials(member)}
                                                        </div>
                                                        <div>
                                                            <strong>{getFullName(member)}</strong>
                                                            <small>
                                                                ID: {member._id?.slice(-8) || '—'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="member-contact">
                                                        <span>
                                                            <Mail size={14} />
                                                            {member.email || '—'}
                                                        </span>
                                                        <span>
                                                            <Phone size={14} />
                                                            {member.mobileNo || '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="member-plan">
                                                        <Crown size={14} />
                                                        {member.membershipPlan || 'No Plan'}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="member-date">
                                                        {formatDate(member.createdAt)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className={`member-status ${getStatusClass(member.membershipStatus)}`}>
                                                        <span className="status-indicator"></span>
                                                        {member.membershipStatus || 'Inactive'}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="member-actions">
                                                        <button
                                                            className="member-view-btn"
                                                            onClick={() => setSelectedMember(member)}
                                                            title="View member details"
                                                        >
                                                            <Eye size={17} />
                                                        </button>

                                                        <button
                                                            className="member-edit-btn"
                                                            onClick={() => openEditModal(member)}
                                                            title="Edit member"
                                                        >
                                                            <Pencil size={17} />
                                                        </button>

                                                        <button
                                                            className="member-deactivate-btn"
                                                            onClick={() => handleDeactivate(member)}
                                                            disabled={actionLoadingId === member._id}
                                                            title="Deactivate member"
                                                        >
                                                            {actionLoadingId === member._id
                                                                ? <RefreshCw size={17} className="spinning" />
                                                                : <UserX size={17} />
                                                            }
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6">
                                                <div className="members-empty">
                                                    <Users size={35} />
                                                    <h3>No members found</h3>
                                                    <p>
                                                        Try changing your search or membership filter.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="members-pagination">
                            <span>
                                Showing {filteredMembers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                                {' '}to{' '}
                                {Math.min(currentPage * PAGE_SIZE, filteredMembers.length)}
                                {' '}of {filteredMembers.length} members
                            </span>

                            <div className="pagination-controls">
                                <button
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={18} />
                                    Previous
                                </button>

                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {selectedMember && (
                <div
                    className="member-modal-overlay"
                    onClick={() => setSelectedMember(null)}
                >
                    <div
                        className="member-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="member-modal-header">
                            <div>
                                <span>MEMBER PROFILE</span>
                                <h2>Member Details</h2>
                            </div>

                            <button
                                className="member-modal-close"
                                onClick={() => setSelectedMember(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="member-modal-profile">
                            <div className="member-modal-avatar">
                                {getInitials(selectedMember)}
                            </div>
                            <div>
                                <h3>{getFullName(selectedMember)}</h3>
                                <p>{selectedMember.email || 'No email provided'}</p>
                                <span className={`member-status ${getStatusClass(selectedMember.membershipStatus)}`}>
                                    <span className="status-indicator"></span>
                                    {selectedMember.membershipStatus || 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="member-details-grid">
                            <div className="member-detail-item">
                                <span>Mobile Number</span>
                                <strong>{selectedMember.mobileNo || '—'}</strong>
                            </div>

                            <div className="member-detail-item">
                                <span>Membership Plan</span>
                                <strong>{selectedMember.membershipPlan || 'No Plan'}</strong>
                            </div>

                            <div className="member-detail-item">
                                <span>Membership Start</span>
                                <strong>{formatDate(selectedMember.membershipStartDate)}</strong>
                            </div>

                            <div className="member-detail-item">
                                <span>Membership End</span>
                                <strong>{formatDate(selectedMember.membershipEndDate)}</strong>
                            </div>

                            <div className="member-detail-item">
                                <span>Registration Date</span>
                                <strong>{formatDate(selectedMember.createdAt)}</strong>
                            </div>

                            <div className="member-detail-item">
                                <span>Member ID</span>
                                <strong>{selectedMember._id || '—'}</strong>
                            </div>
                        </div>

                        <button
                            className="member-modal-done"
                            onClick={() => setSelectedMember(null)}
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            )}

            {editingMember && (
                <div
                    className="member-modal-overlay"
                    onClick={() => !saving && setEditingMember(null)}
                >
                    <div
                        className="member-modal member-edit-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="member-modal-header">
                            <div>
                                <span>MEMBER MANAGEMENT</span>
                                <h2>Edit Member</h2>
                            </div>

                            <button
                                className="member-modal-close"
                                onClick={() => setEditingMember(null)}
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateMember}>
                            <div className="member-edit-form">
                                <label className="member-form-field">
                                    First Name
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={editForm.firstName}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </label>

                                <label className="member-form-field">
                                    Last Name
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={editForm.lastName}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </label>

                                <label className="member-form-field">
                                    Email Address
                                    <input
                                        type="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </label>

                                <label className="member-form-field">
                                    Mobile Number
                                    <input
                                        type="text"
                                        name="mobileNo"
                                        value={editForm.mobileNo}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </label>

                                <label className="member-form-field">
                                    Membership Plan
                                    <select
                                        name="membershipPlan"
                                        value={editForm.membershipPlan}
                                        onChange={handleEditChange}
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Half-Yearly">Half-Yearly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </label>

                                <label className="member-form-field">
                                    Membership Status
                                    <select
                                        name="membershipStatus"
                                        value={editForm.membershipStatus}
                                        onChange={handleEditChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Expired">Expired</option>
                                    </select>
                                </label>
                            </div>

                            <div className="member-edit-actions">
                                <button
                                    type="button"
                                    className="member-edit-cancel"
                                    onClick={() => setEditingMember(null)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="member-edit-save"
                                    disabled={saving}
                                >
                                    {saving
                                        ? <RefreshCw size={17} className="spinning" />
                                        : <Save size={17} />
                                    }
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Members;
