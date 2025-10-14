import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, Plus, X, Eye, FilePenLine, Trash2 } from 'lucide-react';
import ListComponent from '../global/ListComponent';
import ErrorBoundary from '../global/ErrorBoundary';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/api/factories`;

function FactoryOrders() {
    const [modalActiveTab, setModalActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newOrder, setNewOrder] = useState({
        productName: '',
        description: '',
        category: 'Electrical',
        quantity: '',
        unit: 'Piece',
        price: '',
        minStockLevel: 10,
        status: 'Pending'
    });
    
    const [isEdit, setIsEdit] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const { user } = useContext(AuthContext);
    const [orderSearchTerm, setOrderSearchTerm] = useState('');
    const [orderTypeFilter, setOrderTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (user && user.factory) {
            fetchOrders();
        }
    }, [user]);



    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/${user.factory._id}/orders`);
            setOrders(data);
        } catch (error) {
            toast.error('Error fetching factory orders');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };




    const handleAddOrder = async (e) => {
        e.preventDefault();

        const requiredFields = ['productName', 'category', 'quantity', 'unit', 'price'];
        const missingFields = requiredFields.filter(field => !newOrder[field]);
        
        if (missingFields.length > 0) {
            toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        if (newOrder.quantity <= 0) {
            toast.error('Quantity must be greater than 0');
            return;
        }

        if (newOrder.price < 0) {
            toast.error('Price cannot be negative');
            return;
        }

        if (newOrder.minStockLevel < 0) {
            toast.error('Minimum stock level cannot be negative');
            return;
        }

        try {
            const orderData = {
                ...newOrder,
                quantity: parseInt(newOrder.quantity),
                price: parseFloat(newOrder.price),
                minStockLevel: parseInt(newOrder.minStockLevel),
                factoryId: user.factory._id
            };

            if (isEdit) {
                const { data } = await axios.put(`${API_URL}/${currentOrderId}`, orderData);
                toast.success('Order updated successfully');
            } else {
                const { data } = await axios.post(API_URL, orderData);
                toast.success('Order added successfully');
            }
            fetchOrders();

            setShowOrderModal(false);
            setIsEdit(false);
            setCurrentOrderId(null);
            setNewOrder({
                productName: '',
                description: '',
                category: 'Electrical',
                quantity: '',
                unit: 'Piece',
                price: '',
                minStockLevel: 10,
                status: 'Pending'
            });
            
        } catch (error) {
            console.error('Error:', error.response?.data || error);
            toast.error(error.response?.data?.message || (isEdit ? 'Error updating order' : 'Error adding order'));
        }
    };

    const handleDeleteOrder = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await axios.delete(`${API_URL}/${id}`, { data: { factoryId: user.factory._id } });
                toast.success('Order deleted successfully');
                fetchOrders();
            } catch (error) {
                toast.error('Error deleting order');
                console.error('Error deleting order:', error);
            }
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const { data } = await axios.patch(`${API_URL}/${orderId}/status`, { status: newStatus, factoryId: user.factory._id });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            toast.error('Error updating order status');
            console.error('Error:', error);
        }
    };

    const handleEditOrder = (order) => {
        setIsEdit(true);
        setCurrentOrderId(order._id);
        setNewOrder({
            productName: order.productName,
            description: order.description || '',
            category: order.category || 'Electrical',
            quantity: order.quantity,
            unit: order.unit || 'Piece',
            price: order.price || '',
            minStockLevel: order.minStockLevel || 10,
            status: order.status || 'Pending'
        });
        setShowOrderModal(true);
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderDetailsModal(true);
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

    const downloadMultiplePDFs = async () => {
        const keysToDownload = [...new Set(orders
            .filter(item => selectedItems.includes(item._id))
            .map(item => `${item.orderId}-Box-${item.boxNumber}`)
        )];
        
        if (keysToDownload.length === 0) {
            toast.error('Please select items to download PDFs');
            return;
        }

        setIsDownloading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/pdf/download-multiple`,
                { boxKeys: keysToDownload },
                { responseType: 'blob' }
            );

            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `stickers-batch-${new Date().getTime()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Downloaded ${keysToDownload.length} PDFs as ZIP file`);
        } catch (error) {
            toast.error('Error downloading PDFs');
            console.error('Download error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const toggleItemStatus = async (itemId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
            await axios.patch(`${API_URL}/${user.factory._id}/orders/${itemId}/status`, {
                status: newStatus
            });
            
            setOrders(prev => 
                prev.map(item => 
                    item._id === itemId ? { ...item, status: newStatus } : item
                )
            );
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Error updating status');
        }
    };

    const bulkUpdateStatus = async (status) => {
        if (selectedItems.length === 0) {
            toast.error('Please select items to update');
            return;
        }
        
        try {
            await axios.patch(`${API_URL}/${user.factory._id}/orders/bulk-status`, {
                itemIds: selectedItems,
                status
            });
            
            setOrders(prev => 
                prev.map(item => 
                    selectedItems.includes(item._id) ? { ...item, status } : item
                )
            );
            setSelectedItems([]);
            setSelectAll(false);
            toast.success(`${selectedItems.length} items updated to ${status}`);
        } catch (error) {
            toast.error('Error updating statuses');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchTerm === '' || 
            (order.serialNumber && order.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.orderId && order.orderId.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading orders...</p>
                </div>
            );
        }

        // Get unique order IDs
        const uniqueOrders = orders.reduce((acc, order) => {
            if (!acc.find(item => item.orderId === order.orderId)) {
                acc.push(order);
            }
            return acc;
        }, []);

        const filteredUniqueOrders = uniqueOrders.filter(order => {
            const matchesSearch = searchTerm === '' || 
                order.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        return (
            <>
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ORDER ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MODEL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ORDER TYPE</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CREATED DATE</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ITEMS</th>
                            </tr>
                        </thead>
                        <ListComponent
                            items={filteredUniqueOrders}
                            renderItem={(order) => (
                                <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.category?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.model?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            order.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : 
                                            order.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {order.orderType === '2_units' ? '2 Units/Box' : 
                                             order.orderType === '3_units' ? '3 Units/Box' : '1 Unit/Box'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleViewOrder(order)}
                                            className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            {orders.filter(o => o.orderId === order.orderId).length} Items
                                        </button>
                                    </td>
                                </>
                            )}
                            itemContainer="tr"
                            listContainer="tbody"
                            itemClassName="hover:bg-gray-50"
                            listClassName="bg-white divide-y divide-gray-200"
                        />
                    </table>
                </div>

                <div className="md:hidden">
                    <div className="space-y-4 p-4">
                        {filteredUniqueOrders.length > 0 ? (
                            <ListComponent
                                items={filteredUniqueOrders}
                                renderItem={(order) => (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-gray-900">{order.orderId}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                            <div><span className="font-medium">Category:</span> {order.category?.name || 'N/A'}</div>
                                            <div><span className="font-medium">Model:</span> {order.model?.name || 'N/A'}</div>
                                            <div><span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleDateString('en-GB')}</div>
                                            <div className="col-span-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    order.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : 
                                                    order.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {order.orderType === '2_units' ? '2 Units/Box' : 
                                                     order.orderType === '3_units' ? '3 Units/Box' : '1 Unit/Box'}
                                                </span>
                                            </div>
                                            <div className="col-span-2 mt-2">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    {orders.filter(o => o.orderId === order.orderId).length} Items
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                                itemContainer="div"
                                listContainer="div"
                                itemClassName="bg-gray-50 rounded-lg p-4 space-y-2"
                                listClassName="space-y-4"
                            />
                        ) : (
                            <div className="text-center py-12 text-gray-500">No orders found</div>
                        )}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="p-4">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Orders</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
                                <p className="text-sm text-gray-600">Total {orders.reduce((acc, order) => {
                                    if (!acc.find(item => item.orderId === order.orderId)) {
                                        acc.push(order);
                                    }
                                    return acc;
                                }, []).length} unique orders</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* <button
                                        onClick={() => {
                                            setShowOrderModal(true);
                                            setIsEdit(false);
                                            setNewOrder({
                                                productName: '',
                                                description: '',
                                                category: 'Electrical',
                                                quantity: '',
                                                unit: 'Piece',
                                                price: '',
                                                minStockLevel: 10,
                                                status: 'Pending'
                                            });
                                        }}
                                        className="flex items-center justify-center space-x-2 bg-[#4d55f5] text-white px-4 py-2 rounded-lg hover:bg-[#3d45e5] transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>New Order</span>
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {renderContent()}

                    <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Rows per page: 
                            <select className="ml-2 border border-gray-300 rounded px-2 py-1">
                                <option>25</option>
                                <option>50</option>
                                <option>100</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-700">
                            0-0 of 0
                        </div>
                    </div>
                </div>
            </div>

            {showOrderModal && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Order' : 'Add New Order'}</h3>
                            <button
                                onClick={() => {
                                    setShowOrderModal(false);
                                    setIsEdit(false);
                                    setNewOrder({ productName: '', quantity: '', factory: '' });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddOrder}>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newOrder.productName}
                                        onChange={(e) => setNewOrder({...newOrder, productName: e.target.value})}
                                        placeholder="Enter product name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={newOrder.description}
                                        onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                                        placeholder="Enter product description"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <select
                                        required
                                        value={newOrder.category}
                                        onChange={(e) => setNewOrder({...newOrder, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent appearance-none bg-white"
                                    >
                                        <option value="">Select a category</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Lighting">Lighting</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={newOrder.quantity}
                                            onChange={(e) => setNewOrder({...newOrder, quantity: parseInt(e.target.value) || ''})}
                                            placeholder="Enter quantity"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                                        <select
                                            required
                                            value={newOrder.unit}
                                            onChange={(e) => setNewOrder({...newOrder, unit: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent appearance-none bg-white"
                                        >
                                            <option value="Piece">Piece</option>
                                            <option value="Box">Box</option>
                                            <option value="Pack">Pack</option>
                                            <option value="Set">Set</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={newOrder.price}
                                            onChange={(e) => setNewOrder({...newOrder, price: parseFloat(e.target.value) || ''})}
                                            placeholder="Enter price"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={newOrder.minStockLevel}
                                            onChange={(e) => setNewOrder({...newOrder, minStockLevel: parseInt(e.target.value) || 10})}
                                            placeholder="Min stock level"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-2.5 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors font-medium"
                                >
                                    {isEdit ? 'Update Order' : 'Add Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showOrderDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Order Details - {selectedOrder.orderId}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowOrderDetailsModal(false);
                                        setOrderSearchTerm('');
                                        setOrderTypeFilter('all');
                                        setCurrentPage(1);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            
                            {/* Search and Filter Section */}
                            <div className="space-y-4">
                                {/* Status Tabs */}
                                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                                    {['all', 'pending', 'completed'].map((tab) => {
                                        const relatedOrders = orders.filter(order => order.orderId === selectedOrder.orderId);
                                        const count = tab === 'all' 
                                            ? relatedOrders.length
                                            : relatedOrders.filter(order => order.status.toLowerCase() === tab).length;
                                        
                                        return (
                                            <button
                                                key={tab}
                                                onClick={() => setModalActiveTab(tab)}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                    modalActiveTab === tab
                                                        ? 'bg-[#4d55f5] text-white'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
                                            </button>
                                        );
                                    })}
                                </div>
                                
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
                                                onClick={() => bulkUpdateStatus('Completed')}
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                            >
                                                Mark Completed
                                            </button>
                                            <button
                                                onClick={() => bulkUpdateStatus('Pending')}
                                                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                                            >
                                                Mark Pending
                                            </button>
                                            <button
                                                onClick={downloadMultiplePDFs}
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
                                // Get all orders with the same orderId to show grouped view
                                const relatedOrders = orders.filter(order => order.orderId === selectedOrder.orderId);
                                
                                // Filter orders based on search term, order type, and status
                                const filteredOrders = relatedOrders.filter(item => {
                                    const matchesSearch = orderSearchTerm === '' || 
                                        item.serialNumber?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                                        item.orderId?.toLowerCase().includes(orderSearchTerm.toLowerCase());
                                    
                                    const matchesType = orderTypeFilter === 'all' || item.orderType === orderTypeFilter;
                                    
                                    const matchesStatus = modalActiveTab === 'all' || item.status.toLowerCase() === modalActiveTab;
                                    
                                    return matchesSearch && matchesType && matchesStatus;
                                });
                                
                                // Group filtered orders by box number
                                const groupedOrders = Object.entries(
                                    filteredOrders.reduce((groups, item) => {
                                        const boxKey = `Box-${item.boxNumber || 'N/A'}`;
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
                                        
                                        {/* Table */}
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
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                                                                        boxData.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : 
                                                                        boxData.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 
                                                                        'bg-green-100 text-green-800'
                                                                    }`}>
                                                                        {boxData.orderType === '2_units' ? '2 Units' : 
                                                                         boxData.orderType === '3_units' ? '3 Units' : '1 Unit'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <button
                                                                        onClick={async () => {
                                                                            try {
                                                                                const newStatus = allCompleted ? 'Pending' : 'Completed';
                                                                                await axios.patch(`${API_URL}/${user.factory._id}/orders/bulk-status`, {
                                                                                    itemIds: boxData.items.map(item => item._id),
                                                                                    status: newStatus
                                                                                });
                                                                                
                                                                                setOrders(prev => 
                                                                                    prev.map(item => 
                                                                                        boxData.items.find(boxItem => boxItem._id === item._id)
                                                                                            ? { ...item, status: newStatus }
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
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <div className="flex items-center space-x-1">
                                                                        <button
                                                                            onClick={() => downloadPDF(`${boxData.orderId}-Box-${boxData.boxNumber}`, false)}
                                                                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                        >
                                                                            View
                                                                        </button>
                                                                        <button
                                                                            onClick={() => downloadPDF(`${boxData.orderId}-Box-${boxData.boxNumber}`, true)}
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
                                        {relatedOrders.length === 0 
                                            ? 'No related order items found'
                                            : 'No orders match your search criteria'
                                        }
                                    </div>
                                );
                            })()}
                        </div>
                        
                        {/* Fixed Footer with Pagination */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-gray-50">
                            {(() => {
                                const relatedOrders = orders.filter(order => order.orderId === selectedOrder.orderId);
                                const filteredOrders = relatedOrders.filter(item => {
                                    const matchesSearch = orderSearchTerm === '' || 
                                        item.serialNumber?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                                        item.orderId?.toLowerCase().includes(orderSearchTerm.toLowerCase());
                                    const matchesType = orderTypeFilter === 'all' || item.orderType === orderTypeFilter;
                                    const matchesStatus = modalActiveTab === 'all' || item.status.toLowerCase() === modalActiveTab;
                                    return matchesSearch && matchesType && matchesStatus;
                                });
                                
                                const groupedOrders = Object.entries(
                                    filteredOrders.reduce((groups, item) => {
                                        const boxKey = `Box-${item.boxNumber || 'N/A'}`;
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
            )}
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