
import { useEffect, useState } from 'react';
import {
    CreditCard,
    Search,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from 'lucide-react';

import API from '../services/api';
import './payments.css';

function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPayments: 0,
        currentPage: 1,
        totalPages: 0,
        limit: 10
    });

    // Payment status filter
    const [status, setStatus] = useState('');

    // Fetch payments whenever page or status changes
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await API.get('/admin/payments', {
                    params: {
                        page,
                        limit: 10,
                        ...(status && { status })
                    }
                });

                setPayments(response.data.data || []);
                setPagination(response.data.pagination);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Failed to fetch payments'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [page, status]);

    // Change payment filter
    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        setPage(1);
    };

    // Refresh payments
    const handleRefresh = () => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await API.get('/admin/payments', {
                    params: {
                        page,
                        limit: 10,
                        ...(status && { status })
                    }
                });

                setPayments(response.data.data || []);
                setPagination(response.data.pagination);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Failed to refresh payments'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format amount
    const formatAmount = (amount) => {
        return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="payments-page">

            {/* Page Header */}
            <div className="payments-header">
                <div>
                    <h1>Payments</h1>
                    <p>Manage and monitor all membership payments.</p>
                </div>

                <button
                    className="refresh-btn"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Payment Summary */}
            <div className="payment-summary">
                <div className="payment-summary-card">
                    <div className="payment-summary-icon">
                        <CreditCard size={22} />
                    </div>

                    <div>
                        <p>Total Payments</p>
                        <h2>
                            {pagination.totalPayments}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="payments-toolbar">

                <div className="payments-search">
                    <Search size={18} />
                    <span>Payment records</span>
                </div>

                <div className="payment-filter">
                    <label htmlFor="payment-status">
                        Payment Status:
                    </label>

                    <select
                        id="payment-status"
                        value={status}
                        onChange={handleStatusChange}
                    >
                        <option value="">All Payments</option>
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>

            </div>

            {/* Payments Table */}
            <div className="payments-table-container">

                {loading ? (
                    <div className="payments-message">
                        Loading payments...
                    </div>
                ) : error ? (
                    <div className="payments-message error-message">
                        {error}
                    </div>
                ) : payments.length === 0 ? (
                    <div className="payments-message">
                        No payment records found.
                    </div>
                ) : (

                    <div className="table-wrapper">

                        <table className="payments-table">

                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Membership Plan</th>
                                    <th>Amount</th>
                                    <th>Payment ID</th>
                                    <th>Status</th>
                                    <th>Payment Date</th>
                                </tr>
                            </thead>

                            <tbody>

                                {payments.map((payment) => (
                                    <tr key={payment._id}>

                                        <td>
                                            <div className="payment-customer">
                                                <div className="payment-avatar">
                                                    {payment.userId?.firstName
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || 'U'}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {payment.userId
                                                            ? `${payment.userId.firstName} ${payment.userId.lastName || ''}`
                                                            : 'Unknown User'}
                                                    </strong>

                                                    <small>
                                                        {payment.userId?.email || 'N/A'}
                                                    </small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            {payment.planId?.planName || 'N/A'}
                                        </td>

                                        <td>
                                            <strong>
                                                {formatAmount(payment.amount)}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className="payment-id">
                                                {payment.razorpayPaymentId || 'N/A'}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`payment-status ${payment.status?.toLowerCase()}`}
                                            >
                                                {payment.status}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(payment.createdAt)}
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* Pagination */}
            <div className="payments-pagination">

                <p>
                    Showing {payments.length} of {pagination.totalPayments} payments
                </p>

                <div className="pagination-controls">

                    <button
                        onClick={() => setPage((prev) => prev - 1)}
                        disabled={page <= 1 || loading}
                    >
                        <ChevronLeft size={18} />
                        Previous
                    </button>

                    <span>
                        Page {pagination.currentPage || page} of {pagination.totalPages || 1}
                    </span>

                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={
                            page >= pagination.totalPages ||
                            loading ||
                            pagination.totalPages === 0
                        }
                    >
                        Next
                        <ChevronRight size={18} />
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Payments;
