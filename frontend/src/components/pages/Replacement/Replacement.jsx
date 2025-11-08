import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { RefreshCw, Check, X } from 'lucide-react';

export default function Replacement() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/replacement-requests`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRequests(res.data);
        } catch (err) {
            toast.error('Error fetching replacement requests');
            console.error('Error fetching replacement requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/replacement-requests/${id}`, { status }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(`Request ${status.toLowerCase()}`);
            fetchRequests();
        } catch (error) {
            toast.error('Failed to update request status');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Replacement Requests</h1>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-500">Loading requests...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20">
                    <RefreshCw className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No replacement requests</h3>
                    <p className="mt-1 text-sm text-gray-500">New replacement requests will appear here.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map((request) => (
                                <tr key={request._id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.product?.model?.name || 'N/A'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{request.product?.serialNumber || 'N/A'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{request.customer?.name || 'N/A'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{request.reason}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        {request.status === 'Pending' && (
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleStatusUpdate(request._id, 'Approved')} className="text-green-600 hover:text-green-900"><Check className="h-5 w-5" /></button>
                                                <button onClick={() => handleStatusUpdate(request._id, 'Rejected')} className="text-red-600 hover:text-red-900"><X className="h-5 w-5" /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
