import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getFactoryOrders, updateOrderItemStatus, bulkUpdateOrderStatus, downloadMultiplePDFs } from '../services/factoryService';

const API_URL = `${import.meta.env.VITE_API_URL}/api/factories`;

export default function FactoryOrdersModal({ isOpen, onClose, factory, fetchFactories }) {
    const [factoryOrders, setFactoryOrders] = useState([]);
    const [orderSearchTerm, setOrderSearchTerm] = useState('');
    const [orderTypeFilter, setOrderTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (isOpen && factory) {
            const fetchOrders = async () => {
                const orders = await getFactoryOrders(factory._id);
                setFactoryOrders(orders);
            };
            fetchOrders();
        }
    }, [isOpen, factory]);

    const handleClose = () => {
        setFactoryOrders([]);
        setOrderSearchTerm('');
        setOrderTypeFilter('all');
        setCurrentPage(1);
        setSelectedItems([]);
        setSelectAll(false);
        fetchFactories();
        onClose();
    };

    const handleItemSelect = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = (filteredItems) => {
        if (selectAll) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredItems.map(item => item._id));
        }
        setSelectAll(!selectAll);
    };

    const handleDownloadMultiplePDFs = async () => {
        const keysToDownload = [...new Set(factoryOrders
            .filter(item => selectedItems.includes(item._id))
            .map(item => `${item.orderId}-Box-${item.boxNumber}`)
        )];
        setIsDownloading(true);
        await downloadMultiplePDFs(keysToDownload);
        setIsDownloading(false);
    };

    const handleToggleItemStatus = async (itemId, currentStatus) => {
        const newStatus = await updateOrderItemStatus(factory._id, itemId, currentStatus);
        if (newStatus) {
            setFactoryOrders(prev =>
                prev.map(item =>
                    item._id === itemId ? { ...item, status: newStatus } : item
                )
            );
        }
    };

    const handleBulkUpdateStatus = async (status) => {
        await bulkUpdateOrderStatus(factory._id, selectedItems, status);
        setFactoryOrders(prev =>
            prev.map(item =>
                selectedItems.includes(item._id) ? { ...item, status } : item
            )
        );
        setSelectedItems([]);
        setSelectAll(false);
    };

    useEffect(() => {
        if (factoryOrders.length > 0) {
            const filteredOrders = factoryOrders.filter(item => {
                const matchesSearch = orderSearchTerm === '' ||
                    item.serialNumber?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                    item.orderId?.toLowerCase().includes(orderSearchTerm.toLowerCase());
                const matchesType = orderTypeFilter === 'all' || item.orderType === orderTypeFilter;
                return matchesSearch && matchesType;
            });

            if (filteredOrders.length > 0) {
                const allSelected = filteredOrders.every(item => selectedItems.includes(item._id));
                setSelectAll(allSelected && selectedItems.length > 0);
            } else {
                setSelectAll(false);
            }
        }
    }, [selectedItems, factoryOrders, orderSearchTerm, orderTypeFilter]);

    if (!isOpen) return null;

    const downloadPDF = (boxKey, download = false) => {
        const url = `${import.meta.env.VITE_API_URL}/api/pdf/stickers/${boxKey}${download ? '?download=true' : ''}`;
        if (download) {
            // For download, create a temporary link
            const link = document.createElement('a');
            link.href = url;
            link.download = `stickers-${boxKey}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // For view, open in new tab
            window.open(url, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Orders for {factory?.name}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search orders by serial number..."
                                        value={orderSearchTerm}
                                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="sm:w-48">
                                <select
                                    value={orderTypeFilter}
                                    onChange={(e) => setOrderTypeFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white"
                                >
                                    <option value="all">All Order Types</option>
                                    <option value="1_unit">1 Unit/Box</option>
                                    <option value="2_units">2 Units/Box</option>
                                    <option value="3_units">3 Units/Box</option>
                                </select>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedItems.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-sm text-blue-700 font-medium">
                                    {selectedItems.length} item(s) selected
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleBulkUpdateStatus('Completed')}
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                    >
                                        Mark Completed
                                    </button>
                                    <button
                                        onClick={() => handleBulkUpdateStatus('Pending')}
                                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                                    >
                                        Mark Pending
                                    </button>
                                    <button
                                        onClick={handleDownloadMultiplePDFs}
                                        disabled={isDownloading}
                                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        {isDownloading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                Downloading...
                                            </>
                                        ) : (
                                            'Download PDFs'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {(() => {
                        // Filter orders based on search term and order type
                        const filteredOrders = factoryOrders.filter(item => {
                            const matchesSearch = orderSearchTerm === '' ||
                                item.serialNumber?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                                item.orderId?.toLowerCase().includes(orderSearchTerm.toLowerCase());

                            const matchesType = orderTypeFilter === 'all' || item.orderType === orderTypeFilter;

                            return matchesSearch && matchesType;
                        });



                        // Group filtered orders
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

                        return paginatedOrders.length > 0 ? (
                            <div className="space-y-4">
                                {/* Select All Checkbox */}
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={() => handleSelectAll(filteredOrders)}
                                        className="h-4 w-4 text-[#4d55f5] focus:ring-[#4d55f5] border-gray-300 rounded"
                                    />
                                    <label className="text-sm font-medium text-gray-700">
                                        Select All Items ({filteredOrders.length}) - Status updates & PDF downloads
                                    </label>
                                </div>

                                {/* Table Header */}
                                <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Select</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {paginatedOrders.map(([boxKey, boxData]) => {
                                                const allItemsSelected = boxData.items.every(item => selectedItems.includes(item._id));
                                                const allCompleted = boxData.items.every(item => item.status === 'Completed');

                                                return (
                                                    <tr key={boxKey} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={allItemsSelected}
                                                                onChange={() => {
                                                                    if (allItemsSelected) {
                                                                        setSelectedItems(prev => prev.filter(id => !boxData.items.map(item => item._id).includes(id)));
                                                                    } else {
                                                                        setSelectedItems(prev => [...new Set([...prev, ...boxData.items.map(item => item._id)])]);
                                                                    }
                                                                }}
                                                                className="h-4 w-4 text-[#4d55f5] focus:ring-[#4d55f5] border-gray-300 rounded"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                                                            {boxData.items[0].orderId}
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
                                                            {new Date(boxData.items[0].createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        const newStatus = allCompleted ? 'Pending' : 'Completed';
                                                                        await axios.patch(`${API_URL}/${factory._id}/orders/bulk-status`, {
                                                                            itemIds: boxData.items.map(item => item._id),
                                                                            status: newStatus
                                                                        });

                                                                        setFactoryOrders(prev =>
                                                                            prev.map(item =>
                                                                                boxData.items.find(boxItem => boxItem._id === item._id)
                                                                                    ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
                                                                                    : item
                                                                            )
                                                                        );
                                                                        toast.success(`Box status updated to ${newStatus}`);
                                                                    } catch (error) {
                                                                        toast.error('Error updating box status');
                                                                    }
                                                                }}
                                                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                                    allCompleted
                                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                                    }`}
                                                            >
                                                                {allCompleted ? 'Completed' : 'Pending'}
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            {allCompleted ?
                                                                new Date(boxData.items[0].updatedAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })
                                                                : '-'
                                                            }
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex items-center space-x-1">
                                                                <button
                                                                    onClick={() => downloadPDF(boxKey, false)}
                                                                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    onClick={() => downloadPDF(boxKey, true)}
                                                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                                >
                                                                    Download
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {factoryOrders.length === 0
                                    ? 'No order items found for this factory'
                                    : 'No orders match your search criteria'
                                }
                            </div>
                        );
                    })()}
                </div>

                {/* Fixed Footer with Pagination */}
                <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-gray-50">
                    {(() => {
                        const filteredOrders = factoryOrders.filter(item => {
                            const matchesSearch = orderSearchTerm === '' ||
                                item.serialNumber?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                                item.orderId?.toLowerCase().includes(orderSearchTerm.toLowerCase());
                            const matchesType = orderTypeFilter === 'all' || item.orderType === orderTypeFilter;
                            return matchesSearch && matchesType;
                        });

                        const groupedOrders = Object.entries(
                            filteredOrders.reduce((groups, item) => {
                                const boxKey = `${item.orderId}-Box-${item.boxNumber || 'N/A'}`;
                                if (!groups[boxKey]) groups[boxKey] = { items: [] };
                                groups[boxKey].items.push(item);
                                return groups;
                            }, {})
                        );

                        const totalItems = groupedOrders.length;
                        const totalPages = Math.ceil(totalItems / itemsPerPage);
                        const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
                        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

                        return (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {startItem} to {endItem} of {totalItems} orders
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-700">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
