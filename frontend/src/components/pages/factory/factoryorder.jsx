import { useState } from 'react';
import { Eye, Search, CheckCircle, Truck, Clock } from 'lucide-react'; // Added Clock icon for pending
import { useFactoryOrders } from './hooks/useFactoryOrder';
import OrderDetailsModal from './components/orderDetailModal';
import ListComponent from '../../global/ListComponent';
import ErrorBoundary from '../../global/ErrorBoundary';

function FactoryOrders() {
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { 
        orders, 
        loading, 
        handleStatusChange, 
        downloadMultiplePDFs 
    } = useFactoryOrders();

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderDetailsModal(true);
    };

    const uniqueOrders = orders.reduce((acc, order) => {
        if (!acc.find(item => item.orderId === order.orderId)) {
            acc.push(order);
        }
        return acc;
    }, [])
    // ## FIX: Sort unique orders by creation date in descending order ##
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


    const filteredUniqueOrders = uniqueOrders.filter(order => 
        searchTerm === '' || order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Factory Orders</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
                            <p className="text-sm text-gray-600">{uniqueOrders.length} unique orders found</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading your orders...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Items</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispatched</th>

                                    </tr>
                                </thead>
                                <ListComponent
                                    items={filteredUniqueOrders}
                                    renderItem={(order) => {
                                        const itemsInOrder = orders.filter(o => o.orderId === order.orderId);
                                        const completedCount = itemsInOrder.filter(o => o.status === 'Completed').length;
                                        const dispatchedCount = itemsInOrder.filter(o => o.status === 'Dispatched').length;
                                        const pendingCount = itemsInOrder.filter(o => o.status === 'Pending').length;

                                        return (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.category?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.model?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : order.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                        {order.orderType === '2_units' ? '2/Box' : order.orderType === '3_units' ? '3/Box' : '1/Box'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                                                
                                                
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button onClick={() => handleViewOrder(order)} className="inline-flex items-center px-2.5 py-1.5 border border-gray-600 text-xs font-medium rounded text-gray-600 hover:bg-gray-600 hover:text-white transition-colors">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        {itemsInOrder.length} Items
                                                    </button>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="inline-flex items-center px-2.5 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                                            <Clock className="h-4 w-4 mr-1.5" />
                                                            {pendingCount} Pending
                                                    </div>
                                                </td>

                                                 <td className="px-6 py-4 whitespace-nowrap">
                                                     <div className="inline-flex items-center px-2.5 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                                                         <CheckCircle className="h-4 w-4 mr-1.5" />
                                                         {completedCount} Completed
                                                     </div>
                                                 </td>

                                                 <td className="px-6 py-4 whitespace-nowrap">
                                                      <div className="inline-flex items-center px-2.5 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                          <Truck className="h-4 w-4 mr-1.5" />
                                                          {dispatchedCount} Dispatched
                                                     </div> 
                                                 </td>  
                                            </>
                                        );
                                    }}
                                    itemContainer="tr"
                                    listContainer="tbody"
                                    itemClassName="hover:bg-gray-50"
                                    listClassName="bg-white divide-y divide-gray-200"
                                />
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <OrderDetailsModal
                isOpen={showOrderDetailsModal}
                onClose={() => setShowOrderDetailsModal(false)}
                selectedOrder={selectedOrder}
                allOrders={orders}
                handleStatusChange={handleStatusChange}
                downloadMultiplePDFs={downloadMultiplePDFs}
            />
        </div>
    );
}

export default function FactoryOrdersWithErrorBoundary() {
    return (
        <ErrorBoundary>
            <FactoryOrders />
        </ErrorBoundary>
    );
}