import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShoppingCart, RefreshCw, Eye } from 'lucide-react';
import WarrantyDetailsModal from './WarrantyDetailsModal';


const ComplaintModal = ({ isOpen, onClose, onSubmit, sale, product }) => {
    const [complaintDescription, setComplaintDescription] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [preferredVisitDate, setPreferredVisitDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!complaintDescription.trim()) {
            toast.error('Please provide a complaint description.');
            return;
        }
        const formData = new FormData();
        formData.append('productId', product._id);
        formData.append('complaintDescription', complaintDescription);
        if (mediaFile) {
            formData.append('media', mediaFile);
        }
        if (preferredVisitDate) {
            formData.append('preferredVisitDate', preferredVisitDate);
        }
        
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Submit a Complaint</h3>
                
                {/* Display Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-semibold text-gray-600">Product Serial Number</p>
                        <p className="text-gray-800">{product?.serialNumber || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-semibold text-gray-600">Customer Name</p>
                        <p className="text-gray-800">{sale?.customerName || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-semibold text-gray-600">Customer Phone</p>
                        <p className="text-gray-800">{sale?.customerPhone || 'N/A'}</p>
                    </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Complaint Description</label>
                        <textarea
                            id="description"
                            value={complaintDescription}
                            onChange={(e) => setComplaintDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            rows="4"
                            placeholder="Please describe the issue..."
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="media" className="block text-sm font-medium text-gray-700 mb-1">Upload Image/Video (Optional)</label>
                        <input
                            id="media"
                            type="file"
                            onChange={(e) => setMediaFile(e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                    <div>
                        <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date of Visit (Optional)</label>
                        <input
                            id="visitDate"
                            type="date"
                            value={preferredVisitDate}
                            onChange={(e) => setPreferredVisitDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            min={new Date().toISOString().split('T')[0]} // Today as minimum date
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit</button>
                </div>
            </div>
        </div>
    );
};

export default function CustomerPurchases() {
    const [sales, setSales] = useState([]);
    const [replacementRequests, setReplacementRequests] = useState([]);
    const [billingConfig, setBillingConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [selectedWarranty, setSelectedWarranty] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [salesRes, requestsRes, billingRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/sales/customer`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/replacement-requests/customer`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/billing-config`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setSales(salesRes.data);
            setReplacementRequests(requestsRes.data);
            setBillingConfig(billingRes.data);
        } catch (err) {
            toast.error('Error fetching your data');
            console.error('Error fetching customer data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleComplaintFlowStart = (sale) => {
        setSelectedSale(sale);
        setSelectedWarranty(sale.warrantyInfo);
        setShowWarrantyModal(true);
    };

    const handleContinueToComplaint = () => {
        setShowWarrantyModal(false);
        setShowComplaintModal(true);
    };

    const handleConfirmComplaint = async (formData) => {
        setShowComplaintModal(false);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/replacement-requests`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Request submitted successfully');
            fetchData(); // Refresh all data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
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
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className={`inline-block px-2 py-1 rounded text-sm ${warranty.inWarranty ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {warranty.inWarranty ? 'In Warranty' : 'Warranty Expired'}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">Expires: {new Date(warranty.expiryDate).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">No warranty</div>
                                    )}

                                    <div className="mt-4">
                                        {warranty ? (
                                            <button
                                                onClick={() => handleComplaintFlowStart(sale)}
                                                className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${warranty.inWarranty ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                disabled={request && request.status !== 'Rejected'}
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                {warranty.inWarranty ? 'Claim Warranty' : 'Raise Complaint'}
                                            </button>
                                        ) : (
                                            <div className="text-sm text-gray-500">No warranty info</div>
                                        )}
                                    </div>
                                    
                                    {request && request.status === 'Pending' && (
                                        <div className="mt-4 text-sm text-yellow-600">Replacement request under review</div>
                                    )}

                                    {request && request.status === 'Approved' && (
                                        <div className="mt-4 text-sm text-green-600">Replacement request approved</div>
                                    )}

                                    {request && request.status === 'Assigned' && (
                                        <div className="mt-4 text-sm text-blue-600">
                                            Your request has been assigned to a technician
                                        </div>
                                    )}

                                    {request && request.status === 'Rejected' && (
                                        <div className="mt-4 text-sm text-red-600">Replacement request rejected</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedSale && (
                <ComplaintModal
                    isOpen={showComplaintModal}
                    onClose={() => setShowComplaintModal(false)}
                    onSubmit={handleConfirmComplaint}
                    sale={selectedSale}
                    product={selectedSale.product}
                />
            )}

            {selectedWarranty && (
                <WarrantyDetailsModal
                    isOpen={showWarrantyModal}
                    onClose={() => setShowWarrantyModal(false)}
                    onContinue={handleContinueToComplaint}
                    inWarranty={selectedWarranty.inWarranty}
                    billingConfig={billingConfig}
                />
            )}
        </div>
    );
}
