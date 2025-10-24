import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '../../global/ErrorBoundary';
import { useOrders } from './hooks/useOrders';
import { useOrderForm } from './hooks/useOrderForm';

import { OrderFilters } from './components/orderFilters';
import { OrderTable } from './components/orderTable';
import { OrderCard } from './components/orderCard';
import { OrderModal } from './components/orderModal';
import { OrderDetailsModal } from './components/orderDetailsModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { orderService } from './services/orderServices';
import { Trash2 } from 'lucide-react';

function Orders() {

  const [searchTerm, setSearchTerm] = useState('');
  const [factoryFilter, setFactoryFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [isEdit, setIsEdit] = useState(false);
  const [factoryStats, setFactoryStats] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [modalTab, setModalTab] = useState('summary');

  const {
    orders,
    factories,
    categories,
    models,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
    deleteMultipleOrders,
    updateOrderStatus,
    markOrderAsDispatched,
    transferToProducts,
    refreshOrders
  } = useOrders();

  const {
    formData,
    filteredModels,
    selectedModelDetails,
    updateField,
    updateOrderType,
    updateTotalPumps,
    resetForm,
    validateForm,
    getSubmitData
  } = useOrderForm(isEdit, selectedOrder, models);

  const filteredOrders = orders.filter(order => {

    const matchesSearch = (order.productName && order.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (order.factory && order.factory.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFactory = factoryFilter === 'all' || order.factory?._id === factoryFilter;
    const matchesOrderType = orderTypeFilter === 'all' || order.orderType === orderTypeFilter;

    return matchesSearch && matchesFactory && matchesOrderType;
  });

  // Apply pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleAddOrder = async (e) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const submitData = getSubmitData();

    if (isEdit) {
      const success = await updateOrder(selectedOrder._id, submitData);
      if (success) {
        resetFormState();
      }
    } else {
      const success = await addOrder(submitData);
      if (success) {
        resetFormState();
      }
    }
  };

  const resetFormState = () => {
    setShowOrderModal(false);
    setIsEdit(false);
    setSelectedOrder(null);
    resetForm();
  };

  const handleEditOrder = (order) => {
    if (factories.length === 0) {
      toast.error('Please wait for factories to load');
      return;
    }
    setIsEdit(true);
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
    setModalTab('summary');

    try {
      const [statsRes, itemsRes] = await Promise.all([
        orderService.fetchOrderStats(order._id),
        orderService.fetchOrderItems(order._id)
      ]);
      setFactoryStats(statsRes.data);
      console.log(statsRes.data);
      setOrderItems(itemsRes.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Error fetching order details');
      setFactoryStats({});
      setOrderItems([]);
    }
  };

  const handleDispatchOrder = async (id) => {
    const success = await markOrderAsDispatched(id);
    if (success) {
      handleViewOrder(selectedOrder);
    }
  };

  const handleAddOrderClick = () => {
    if (factories.length === 0) {
      toast.error('Please wait for factories to load');
      return;
    }
    setIsEdit(false);
    setSelectedOrder(null);
    resetForm();
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setIsEdit(false);
    setSelectedOrder(null);
    resetForm();
  };

  const handleCloseDetailsModal = () => {
    setShowOrderDetailsModal(false);
    setFactoryStats({});
    setOrderItems([]);
  };

  const handleSelect = (id) => {
    setSelectedOrders(prev =>
        prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
      if (e.target.checked) {
          setSelectedOrders(currentItems.map(o => o._id));
      } else {
          setSelectedOrders([]);
      }
  };

  const handleDeleteSelected = () => {
      deleteMultipleOrders(selectedOrders).then(() => {
          setSelectedOrders([]);
      });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}


        {/* Filters and Actions */}
        <div className="p-4 sm:p-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
              <p className="text-sm text-gray-600">Total {filteredOrders.length}</p>
            </div>

            <div className="space-y-3 sm:space-y-0 flex flex-col sm:flex-row items-stretch sm:items-center sm:space-x-4">
              {selectedOrders.length > 0 ? (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete ({selectedOrders.length})</span>
                </button>
              ) : (
                <OrderFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  factoryFilter={factoryFilter}
                  onFactoryFilterChange={setFactoryFilter}
                  orderTypeFilter={orderTypeFilter}
                  onOrderTypeFilterChange={setOrderTypeFilter}
                  factories={factories}
                  onAddOrder={handleAddOrderClick}
                />
              )}

            </div>
          </div>
        </div>

        {/* Table and Cards */}
        <div>
          {currentItems.length > 0 ? (
            <>
              <OrderTable
                orders={currentItems}
                onView={handleViewOrder}
                onEdit={handleEditOrder}
                onDelete={deleteOrder}
                onStatusChange={updateOrderStatus}
                selectedOrders={selectedOrders}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
              />
              <OrderCard
                orders={currentItems}
                onView={handleViewOrder}
                onEdit={handleEditOrder}
                onDelete={deleteOrder}
                onStatusChange={updateOrderStatus}
                selectedOrders={selectedOrders}
                onSelect={handleSelect}
              />
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No orders found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Rows per page:
            <select
              className="ml-2 border border-gray-300 rounded px-2 py-1"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when items per page changes
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OrderModal
        isOpen={showOrderModal}
        isEdit={isEdit}
        formData={formData}
        filteredModels={filteredModels}
        selectedModelDetails={selectedModelDetails}
        categories={categories}
        factories={factories}
        onUpdateField={updateField}
        onUpdateOrderType={updateOrderType}
        onUpdateTotalPumps={updateTotalPumps}
        onSubmit={handleAddOrder}
        onClose={handleCloseOrderModal}
      />

      <OrderDetailsModal
        isOpen={showOrderDetailsModal}
        order={selectedOrder}
        factoryStats={factoryStats}
        orderItems={orderItems}
        modalTab={modalTab}
        onTabChange={setModalTab}
        onClose={handleCloseDetailsModal}
        onDispatch={() => handleDispatchOrder(selectedOrder._id)}
        onTransfer={transferToProducts}
        onStatusChange={async (itemIds, status) => {
          await orderService.bulkUpdateOrderStatus(selectedOrder.factory._id, itemIds, status);
          const itemsRes = await orderService.fetchOrderItems(selectedOrder._id);
          setOrderItems(itemsRes.data);
        }}
      />
    </div>
  );
}

// Wrap the Orders component with ErrorBoundary
export default function OrdersWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Orders />
    </ErrorBoundary>
  );
}