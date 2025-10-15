import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, Download, Eye, QrCode } from 'lucide-react';
import ErrorBoundary from '../global/ErrorBoundary';
import QRScannerModal from '../global/QRScannerModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/api/factories`;

function FactorySales() {
    const [searchTerm, setSearchTerm] = useState('');
    const [dispatchedOrders, setDispatchedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showScanner, setShowScanner] = useState(false);
    const itemsPerPage = 10;
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user && user.factory) {
            fetchDispatchedOrders();
        }
    }, [user]);

    const fetchDispatchedOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/${user.factory._id}/sales`);
            setDispatchedOrders(data);
        } catch (error) {
            toast.error('Error fetching sales data');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };


    const downloadPDF = (boxKey, download = false) => {
        const url = `${import.meta.env.VITE_API_URL}/api/pdf/stickers/${boxKey}${download ? '?download=true' : ''}`;
        if (download) {
            const link = document.createElement('a');
            link.href = url;
            link.download = `stickers-${boxKey}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            window.open(url, '_blank');
        }
    };

    // Filter orders based on search term
    const filteredOrders = dispatchedOrders.filter(order => {
        const matchesSearch = searchTerm === '' || 
            order.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Group filtered orders by box
    const groupedOrders = Object.entries(
        filteredOrders.reduce((groups, item) => {
            const boxKey = `${item.orderId}-Box-${item.boxNumber || 'N/A'}`;
            if (!groups[boxKey]) {
                groups[boxKey] = {
                    boxNumber: item.boxNumber,
                    orderId: item.orderId,
                    category: item.category,
                    model: item.model,
                    orderType: item.orderType,
                    dispatchedDate: item.dispatchedAt,
                    completedDate: item.completedAt,
                    items: []
                };
            }
            groups[boxKey].items.push(item);
            return groups;
        }, {})
    );

    // Pagination
    const totalItems = groupedOrders.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = groupedOrders.slice(startIndex, startIndex + itemsPerPage);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading sales data...</p>
                </div>
            );
        }

        return paginatedOrders.length > 0 ? (
            <div className="space-y-4">
                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatched Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedOrders.map(([boxKey, boxData]) => (
                                <tr key={boxKey} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                                        {boxData.orderId}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        Box {boxData.boxNumber}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="space-y-1">
                                            {boxData.items.map((it, idx) => (
                                                <div key={it._id || idx}>{it?.serialNumber}</div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {boxData.category?.name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {boxData.model?.name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            boxData.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : boxData.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {boxData.orderType === '2_units' ? '2 Units' : boxData.orderType === '3_units' ? '3 Units' : '1 Unit'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {boxData.completedDate ? new Date(boxData.completedDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {boxData.dispatchedDate ? new Date(boxData.dispatchedDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => downloadPDF(boxKey, false)}
                                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => downloadPDF(boxKey, true)}
                                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                            >
                                                <Download className="h-3 w-3" />
                                                Download
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {Math.ceil(totalItems / itemsPerPage) > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="text-sm text-gray-700">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} sales
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700">
                                Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(Math.ceil(totalItems / itemsPerPage), currentPage + 1))}
                                disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="text-center py-12 text-gray-500">
                {dispatchedOrders.length === 0 
                    ? 'No dispatched orders found'
                    : 'No sales match your search criteria'
                }
            </div>
        );
    };

    return (
        <div className="p-4">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Sales</h1>
                    <p className="text-gray-600">Track all completed orders and their details</p>
                </div>

                <QRScannerModal 
                    isOpen={showScanner} 
                    onClose={() => setShowScanner(false)}
                    onProductUpdated={fetchDispatchedOrders}
                />

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Dispatched Orders</h2>
                                <p className="text-sm text-gray-600">
                                    Total {dispatchedOrders.length} dispatched items
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <button
                                    onClick={() => setShowScanner(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <QrCode className="h-4 w-4" />
                                    Scan Product
                                </button>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by order ID or serial number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default function FactorySalesWithErrorBoundary() {
    return (
        <ErrorBoundary>
            <FactorySales />
        </ErrorBoundary>
    );
}