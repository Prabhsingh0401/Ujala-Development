import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';

export default function TechnicianRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { technician } = useContext(AuthContext);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/technicians/requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(res.data);
        } catch (err) {
            toast.error('Error fetching requests');
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (technician) {
            fetchRequests();
        }
    }, [technician]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Assigned Requests</h1>
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-500">Loading requests...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20">
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No requests found</h3>
                    <p className="mt-1 text-sm text-gray-500">You have no assigned requests.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map((request) => (
                                <tr key={request._id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.product.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{request.product.serialNumber}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{request.customer.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{request.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
