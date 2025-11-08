import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShoppingCart, RefreshCw } from 'lucide-react';

const ReasonModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for the replacement.');
            return;
        }
        onSubmit(reason);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reason for Replacement</h3>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="4"
                    placeholder="Please describe the issue with the product..."
                ></textarea>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Request</button>
                </div>
            </div>
        </div>
    );
};

export default function CustomerDashboard() {
    const [sales, setSales] = useState([]);
    const [replacementRequests, setReplacementRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [salesRes, requestsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/sales/customer`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/replacement-requests/customer`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setSales(salesRes.data);
            setReplacementRequests(requestsRes.data);
        } catch (err) {
            toast.error('Error fetching your data');
            console.error('Error fetching customer data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleReplaceClick = (productId) => {
        setSelectedProductId(productId);
        setShowReasonModal(true);
    };

    const handleConfirmReplacement = async (reason) => {
        setShowReasonModal(false);
        if (!selectedProductId) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/replacement-requests`, { productId: selectedProductId, reason }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Replacement request submitted successfully');
            fetchData(); // Refresh all data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit replacement request');
        }
    };

    const replacementRequestMap = new Map(replacementRequests.map(req => [req.product._id, req]));

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">My Purchases</h1>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-500">Loading purchases...</p>
                </div>
            ) : sales.length === 0 ? (
                <div className="text-center py-20">
                    <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No purchases yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Buy a product to see it here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sales.map((sale) => {
                        const product = sale.product;
                        const productName = product?.productName || product?.model?.name || '-';
                        const serial = product?.serialNumber || '-';
                        const soldAt = sale.soldAt ? new Date(sale.soldAt) : new Date(sale.createdAt);
                        const sellerName = sale.dealer?.name || sale.distributor?.name || '-';
                        const warranty = sale.warrantyInfo;
                        const request = replacementRequestMap.get(product?._id);

                        return (
                            <div key={sale._id} className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
                                <div>
                                    <div className="text-lg font-semibold text-gray-800">{productName}</div>
                                    <div className="text-sm text-gray-500 mt-1">S/N: {serial}</div>
                                    <div className="mt-3 text-sm text-gray-600">Bought: <span className="font-medium text-gray-800">{soldAt.toLocaleDateString()}</span></div>
                                    <div className="text-sm text-gray-600">From: <span className="font-medium text-gray-800">{sellerName}</span></div>
                                    <div className="text-sm text-gray-600">Plumber: <span className="font-medium text-gray-800">{sale.plumberName || '-'}</span></div>
                                </div>

                                <div className="mt-4">
                                    {warranty ? (
                                        <div>
                                            <div className={`inline-block px-2 py-1 rounded text-sm ${warranty.inWarranty ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {warranty.inWarranty ? 'In Warranty' : 'Warranty Expired'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">Expires: {new Date(warranty.expiryDate).toLocaleDateString()}</div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">No warranty</div>
                                    )}

                                    {warranty?.inWarranty && (!request || request.status === 'Rejected') && (
                                        <button
                                            onClick={() => handleReplaceClick(product?._id)}
                                            className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Request Replacement
                                        </button>
                                    )}

                                    {request && request.status === 'Pending' && (
                                        <div className="mt-4 text-sm text-yellow-600">Replacement request under review</div>
                                    )}

                                    {request && request.status === 'Approved' && (
                                        <div className="mt-4 text-sm text-green-600">Replacement request approved</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ReasonModal
                isOpen={showReasonModal}
                onClose={() => setShowReasonModal(false)}
                onSubmit={handleConfirmReplacement}
            />
        </div>
    );
}
