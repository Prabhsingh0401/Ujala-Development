import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';
import { Package, User, Phone, Mail, MapPin } from 'lucide-react';

export default function TechnicianRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

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
        if (user && user.role === 'technician') {
            fetchRequests();
        }
    }, [user]);

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {requests.map((request) => (
                        <div key={request._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <Package className="h-6 w-6 text-indigo-600 mr-3" />
                                    <h3 className="text-xl font-semibold text-gray-800">Product Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="font-semibold">Name:</span> {request.product?.model?.name || 'N/A'}</div>
                                    <div><span className="font-semibold">Serial No:</span> {request.product?.serialNumber || 'N/A'}</div>
                                    <div><span className="font-semibold">MRP:</span> ₹{request.product?.model?.specifications?.mrpPrice || 'N/A'}</div>
                                    <div><span className="font-semibold">Weight:</span> {request.product?.model?.specifications?.grossWeight || 'N/A'}</div>
                                    <div><span className="font-semibold">KW/HP:</span> {request.product?.model?.specifications?.kwHp || 'N/A'}</div>
                                    <div><span className="font-semibold">Voltage:</span> {request.product?.model?.specifications?.voltage || 'N/A'}</div>
                                    <div className="col-span-2"><span className="font-semibold">Reason for Replacement:</span> {request.reason}</div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-6 border-t border-gray-200">
                                <div className="flex items-center mb-4">
                                    <User className="h-6 w-6 text-indigo-600 mr-3" />
                                    <h3 className="text-xl font-semibold text-gray-800">Customer Details</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center"><User className="h-4 w-4 text-gray-500 mr-2" /> {request.customer?.name || 'N/A'}</div>
                                    <div className="flex items-center"><Phone className="h-4 w-4 text-gray-500 mr-2" /> {request.customer?.phone || 'N/A'}</div>
                                    <div className="flex items-center"><MapPin className="h-4 w-4 text-gray-500 mr-2" /> {`${request.customer?.address || ''}`}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
