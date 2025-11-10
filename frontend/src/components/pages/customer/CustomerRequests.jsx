import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function CustomerRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/replacement-requests/customer`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data || []);
        } catch (err) {
            toast.error('Error fetching replacement requests');
            console.error('Error fetching replacement requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">My Requests</h1>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-500">Loading requests...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 text-gray-500">You have not raised any replacement requests.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requests.map((req) => {
                        const product = req.product || {};
                        const productName = product.productName || product.model?.name || '-';
                        const serial = product.serialNumber || '-';
                        const soldAt = req.sale?.soldAt ? new Date(req.sale.soldAt) : (req.createdAt ? new Date(req.createdAt) : null);

                        return (
                            <div key={req._id} className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
                                <div>
                                    <div className="text-lg font-semibold text-gray-800">{productName}</div>
                                    <div className="text-sm text-gray-500 mt-1">S/N: {serial}</div>
                                    {soldAt && <div className="mt-2 text-sm text-gray-600">Raised: <span className="font-medium text-gray-800">{soldAt.toLocaleDateString()}</span></div>}

                                    <div className="mt-3 text-sm text-gray-600">Reason: <span className="font-medium text-gray-800">{req.reason || '-'}</span></div>

                                    <div className="mt-3">
                                        <div className={`inline-block px-2 py-1 rounded text-sm ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : req.status === 'Assigned' ? 'bg-blue-100 text-blue-800' : req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {req.status}
                                        </div>
                                    </div>

                                    {req.status === 'Assigned' && req.technician && (
                                        <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                            <div className="font-medium">Technician Assigned</div>
                                            <div>Name: {req.technician.name}</div>
                                            <div>Phone: {req.technician.phone}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
