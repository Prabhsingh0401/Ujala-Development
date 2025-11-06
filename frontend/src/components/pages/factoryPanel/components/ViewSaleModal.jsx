import React, {useState} from 'react';
import { X } from 'lucide-react';

const ViewSaleModal = ({ isOpen, onClose, saleData }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    if (!isOpen) return null;

    const groupedItems = saleData.items.reduce((acc, item) => {
        const { boxNumber } = item;
        if (!acc[boxNumber]) {
            acc[boxNumber] = [];
        }
        acc[boxNumber].push(item);
        return acc;
    }, {});

    const groupedItemsArray = Object.entries(groupedItems);
    const totalItems = groupedItemsArray.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = groupedItemsArray.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 sm:mx-auto">
                <div className="flex justify-between items-center p-3 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Order Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>

                {saleData ? (
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Order Information */}
                            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong className="font-medium text-gray-600">Order ID:</strong> <span className="text-gray-800 font-mono">{saleData.orderId}</span></p>
                                    <p><strong className="font-medium text-gray-600">Category:</strong> <span className="text-gray-800">{saleData.category?.name}</span></p>
                                    <p><strong className="font-medium text-gray-600">Model:</strong> <span className="text-gray-800">{saleData.model?.name}</span></p>
                                    <p><strong className="font-medium text-gray-600">Order Type:</strong> 
                                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                                            saleData.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : saleData.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {saleData.orderType === '2_units' ? '2 Units' : saleData.orderType === '3_units' ? '3 Units' : '1 Unit'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Items</h3>
                            <div className="rounded-lg bg-gray-50 overflow-hidden max-h-64 overflow-y-auto">
                                <ul className="divide-y divide-gray-200">
                                    {paginatedItems.map(([boxNumber, items]) => (
                                        <li key={boxNumber} className="p-2">
                                            <p className="text-xs font-medium text-gray-600 mb-1">Box: {boxNumber}</p>
                                            <ul className="divide-y divide-gray-100 pl-2">
                                                {items.map((item, index) => (
                                                    <li key={item._id || index} className="py-1 grid grid-cols-3 items-center">
                                                        <p className="text-xs font-mono text-gray-800 col-span-1">{item.serialNumber}</p>
                                                        <p className="text-xs text-gray-600 col-span-1">Completed: {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '-'}</p>
                                                        <p className="text-xs text-gray-600 col-span-1">Dispatched: {item.dispatchedAt ? new Date(item.dispatchedAt).toLocaleDateString() : '-'}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                                    <div className="text-sm text-gray-700">
                                        Rows per page:
                                        <select
                                            className="ml-2 border border-gray-300 rounded px-2 py-1"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="15">15</option>
                                        </select>
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
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-10 text-gray-500">
                        <p>No sales data available.</p>
                    </div>
                )}

                <div className="flex justify-end p-3 bg-gray-50 border-t border-gray-200 rounded-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewSaleModal;
