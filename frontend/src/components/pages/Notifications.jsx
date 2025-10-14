import { useState, useEffect, useContext } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';

export default function Notifications() {
    const { user } = useContext(AuthContext);
    const [passwordResetRequests, setPasswordResetRequests] = useState([]);
    const [distributorRequests, setDistributorRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPasswordResetRequest, setSelectedPasswordResetRequest] = useState(null);
    const [selectedDistributorRequest, setSelectedDistributorRequest] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [newUsername, setNewUsername] = useState(''); // New state for username
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [approveLoading, setApproveLoading] = useState(false);

    const getConfig = () => {
        return {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const [passwordResetRes, distributorReqRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/auth/password-reset-requests`, getConfig()),
                axios.get(`${import.meta.env.VITE_API_URL}/api/distributor-requests/pending`, getConfig())
            ]);
            setPasswordResetRequests(passwordResetRes.data);
            setDistributorRequests(distributorReqRes.data);
        } catch (error) {
            toast.error('Error fetching requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveDistributorRequest = async (e, requestId) => {
        e.preventDefault();
        setApproveLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/distributor-requests/${requestId}/approve`, {
                username: newUsername,
                password: newPassword
            }, getConfig());
            toast.success('Distributor request approved and distributor created!');
            setSelectedDistributorRequest(null);
            setNewUsername('');
            setNewPassword('');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Approval failed');
        } finally {
            setApproveLoading(false);
        }
    };

    const handleRejectDistributorRequest = async (requestId) => {
        if (window.confirm('Are you sure you want to reject this distributor request?')) {
            try {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/distributor-requests/${requestId}/reject`, {}, getConfig());
                toast.success('Distributor request rejected!');
                fetchRequests();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Rejection failed');
            }
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                requestId: selectedPasswordResetRequest._id,
                newPassword
            }, getConfig());
            toast.success('Password reset successfully!');
            setSelectedPasswordResetRequest(null);
            setNewPassword('');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset failed');
        } finally {
            setResetLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-2">Manage all pending requests.</p>
            </div>

            {/* Password Reset Requests */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Password Reset Requests</h2>
                {passwordResetRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending password reset requests</h3>
                        <p className="text-gray-500">All password reset requests have been processed.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-amber-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Entity</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Username</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Location</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Requested</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {passwordResetRequests.map((request) => (
                                        <tr key={request._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900 capitalize">{request.role}</td>
                                            <td className="px-6 py-4">
                                                {request.role === 'factory' && (
                                                    <div className="font-medium text-gray-900">{request.factory?.name}</div>
                                                )}
                                                {request.role === 'distributor' && (
                                                    <div className="font-medium text-gray-900">{request.distributor?.name}</div>
                                                )}
                                                <div className="text-sm text-gray-500">
                                                    {request.role === 'factory' && `Code: ${request.factory?.code}`}
                                                    {request.role === 'distributor' && `ID: ${request.distributor?._id}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">{request.username}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {request.role === 'factory' && request.factory?.location}
                                                {request.role === 'distributor' && request.distributor?.location}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(request.requestedAt).toLocaleDateString()} at{' '}
                                                {new Date(request.requestedAt).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedPasswordResetRequest(request)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                                >
                                                    Reset Password
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* New Distributor Requests */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">New Distributor Requests</h2>
                {distributorRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending distributor requests</h3>
                        <p className="text-gray-500">All new distributor requests have been processed.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-amber-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Email</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Location</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Requested</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {distributorRequests.map((request) => (
                                        <tr key={request._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900">{request.name}</td>
                                            <td className="px-6 py-4 text-gray-900">{request.email}</td>
                                            <td className="px-6 py-4 text-gray-600">{request.location}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(request.requestedAt).toLocaleDateString()} at{' '}
                                                {new Date(request.requestedAt).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 flex space-x-2">
                                                <button
                                                    onClick={() => setSelectedDistributorRequest(request)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectDistributorRequest(request._id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Reset Password Modal */}
            {selectedPasswordResetRequest && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
                            <button
                                onClick={() => setSelectedPasswordResetRequest(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Type: <span className="font-medium capitalize">{selectedPasswordResetRequest.role}</span></p>
                            {selectedPasswordResetRequest.role === 'factory' && (
                                <p className="text-sm text-gray-600">Factory: <span className="font-medium">{selectedPasswordResetRequest.factory?.name}</span></p>
                            )}
                            {selectedPasswordResetRequest.role === 'distributor' && (
                                <p className="text-sm text-gray-600">Distributor: <span className="font-medium">{selectedPasswordResetRequest.distributor?.name}</span></p>
                            )}
                            <p className="text-sm text-gray-600">Username: <span className="font-medium">{selectedPasswordResetRequest.username}</span></p>
                        </div>
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPasswordResetRequest(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl disabled:opacity-50"
                                >
                                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Approve Distributor Request Modal */}
            {selectedDistributorRequest && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Approve Distributor Request</h3>
                            <button
                                onClick={() => {
                                    setSelectedDistributorRequest(null);
                                    setNewUsername('');
                                    setNewPassword('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Request from: <span className="font-medium">{selectedDistributorRequest.name}</span></p>
                            <p className="text-sm text-gray-600">Email: <span className="font-medium">{selectedDistributorRequest.email}</span></p>
                        </div>
                        <form onSubmit={(e) => handleApproveDistributorRequest(e, selectedDistributorRequest._id)}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Username for Distributor
                                </label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Password for Distributor
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Enter password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedDistributorRequest(null);
                                        setNewUsername('');
                                        setNewPassword('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={approveLoading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl disabled:opacity-50"
                                >
                                    {approveLoading ? 'Approving...' : 'Approve Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}