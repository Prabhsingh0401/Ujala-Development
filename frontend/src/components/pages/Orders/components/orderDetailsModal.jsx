// src/pages/Orders/components/OrderDetailsModal.jsx
import { X } from 'lucide-react';
import { useState } from 'react';
import { StatusTabs } from './StatusTabs';

export function OrderDetailsModal({
  isOpen,
  order,
  factoryStats,
  orderItems,
  modalTab,
  onTabChange,
  onClose,
  onTransfer
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  if (!isOpen || !order) return null;

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const completableItems = orderItems.filter(item => item.status === 'Completed' && !item.isTransferredToProduct);
    const completableItemIds = completableItems.map(item => item._id);

    const allSelected = completableItemIds.every(id => selectedItems.includes(id));

    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !completableItemIds.includes(id)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...completableItemIds])]);
    }
  };

  const handleTransfer = () => {
    onTransfer(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  const getTotalUnits = () => {
    return order.totalUnits || 
           (order.quantity * (order.orderType === '2_units' ? 2 : 
                             order.orderType === '3_units' ? 3 : 1));
  };

  const completedItems = orderItems.filter(item => item.status === 'Completed');

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
          <div className="flex items-center space-x-2">
            {modalTab === 'details' && completedItems.length > 0 && (
              <button
                onClick={handleTransfer}
                disabled={selectedItems.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                Transfer Selected ({selectedItems.length})
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => onTabChange('summary')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                modalTab === 'summary'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => onTabChange('details')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                modalTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {modalTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-base font-medium text-gray-900">{order.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="text-base font-medium text-blue-600">{order.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-base font-medium text-gray-900">{order.category?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Model</p>
                <p className="text-base font-medium text-gray-900">{order.model?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Boxes</p>
                <p className="text-base font-medium text-gray-900">{order.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Units</p>
                <p className="text-base font-medium text-blue-600">{getTotalUnits()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Type</p>
                <p className="text-base font-medium text-gray-900">
                  {order.orderType === '2_units' ? '2 Units per Box' : 
                   order.orderType === '3_units' ? '3 Units per Box' : '1 Unit per Box'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Factory</p>
                <p className="text-base font-medium text-gray-900">{order.factory?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-base font-medium text-gray-900">{order.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transferred to Product</p>
                <p className="text-base font-medium text-gray-900">{order.isTransferredToProduct ? 'Yes' : 'No'}</p>
              </div>

              {/* Factory Completion Stats */}
              {factoryStats.totalItems && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Factory Production Status</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-blue-600">{factoryStats.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${factoryStats.completionPercentage}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{factoryStats.totalItems}</div>
                        <div className="text-gray-600">Total Items</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">{factoryStats.completedItems}</div>
                        <div className="text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-yellow-600">{factoryStats.pendingItems}</div>
                        <div className="text-gray-600">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Model Specifications */}
              {order.model?.specifications && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Model Specifications</p>
                  <div className="bg-gray-50 p-3 rounded-lg grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">QUANTITY</span>: {order.model.specifications.quantity || '1N'}</div>
                    <div><span className="font-medium">GROSS.WT</span>: {order.model.specifications.grossWeight}</div>
                    <div><span className="font-medium">kW/HP</span>: {order.model.specifications.kwHp}</div>
                    <div><span className="font-medium">Voltage</span>: {order.model.specifications.voltage}</div>
                    <div className="col-span-2">
                      <span className="font-medium">MRP Rs.</span>: ₹{order.model.specifications.mrpPrice}/- Each<br/>
                      <span className="text-xs">(Incl of all taxes)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {modalTab === 'details' && (
            <div>
              <StatusTabs status={statusFilter} onStatusChange={setStatusFilter} />
              <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input 
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={selectedItems.length === completedItems.length && completedItems.length > 0}
                          disabled={completedItems.length === 0 || statusFilter === 'Pending'}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transferred</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                                      {Object.values(orderItems.filter(item => statusFilter === 'all' || item.status === statusFilter).reduce((acc, item) => {
                                        if (!acc[item.boxNumber]) {
                                          acc[item.boxNumber] = {
                                            boxNumber: item.boxNumber,
                                            itemIds: [],
                                            serialNumbers: [],
                                            status: item.status,
                                            createdAt: item.createdAt,
                                            updatedAt: item.updatedAt,
                                            isTransferredToProduct: true
                                          };
                                        }
                                        if (!item.isTransferredToProduct) {
                                          acc[item.boxNumber].isTransferredToProduct = false;
                                        }
                                        acc[item.boxNumber].itemIds.push(item._id);
                                        acc[item.boxNumber].serialNumbers.push(item.serialNumber);
                                        return acc;
                                      }, {})).map(groupedItem => {
                                        const isAllSelected = groupedItem.itemIds.every(id => selectedItems.includes(id));
                                        return (
                                          <tr key={groupedItem.boxNumber} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <input 
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={() => {
                                                  const allIds = groupedItem.itemIds;
                                                  if (isAllSelected) {
                                                    setSelectedItems(prev => prev.filter(id => !allIds.includes(id)));
                                                  } else {
                                                    setSelectedItems(prev => [...new Set([...prev, ...allIds])]);
                                                  }
                                                }}
                                                disabled={groupedItem.status !== 'Completed' || groupedItem.isTransferredToProduct}
                                              />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Box {groupedItem.boxNumber}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                                              {groupedItem.serialNumbers.map(serial => <div key={serial}>{serial}</div>)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${groupedItem.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {groupedItem.status}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                              {new Date(groupedItem.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                              })}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                              {groupedItem.status === 'Completed'
                                                ? new Date(groupedItem.updatedAt).toLocaleDateString('en-US', {
                                                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })
                                                : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                              {groupedItem.isTransferredToProduct ? 'Yes' : 'No'}
                                            </td>
                                          </tr>
                                        );
                                      })}                </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}