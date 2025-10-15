import { X } from 'lucide-react';
import { useState } from 'react';

export function OrderDetailsModal({
  isOpen,
  order,
  factoryStats,
  orderItems,
  modalTab,
  onTabChange,
  onClose,
  onTransfer,
  onDispatch
}) {
  const [selectedItems, setSelectedItems] = useState([]);

  if (!isOpen || !order) return null;

  // FIX: Filter for items with status 'Dispatched'
  const dispatchableItems = orderItems.filter(item => item.status === 'Dispatched' && !item.isTransferredToProduct);

  const handleSelectAll = () => {
    const dispatchableItemIds = dispatchableItems.map(item => item._id);
    const allSelected = dispatchableItemIds.length > 0 && dispatchableItemIds.every(id => selectedItems.includes(id));

    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !dispatchableItemIds.includes(id)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...dispatchableItemIds])]);
    }
  };

  const handleTransfer = () => {
    onTransfer(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  const getTotalUnits = () => {
    return order.totalUnits || (order.quantity * (order.orderType === '2_units' ? 2 : order.orderType === '3_units' ? 3 : 1));
  };

  // FIX: Filter items by status for this calculation
  const dispatchedItemsForDisplay = orderItems.filter(item => item.status === 'Dispatched');

  const dispatchedPercentage = factoryStats.completedItems > 0 ? Math.round((factoryStats.dispatchedItems / factoryStats.completedItems) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
          <div className="flex items-center space-x-2">
            {/* FIX: Simplified dispatch button logic based on status */}
            {modalTab === 'details' && order.status === 'Completed' && (
              <button
                onClick={onDispatch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                Mark as Dispatched
              </button>
            )}
            {modalTab === 'details' && dispatchedItemsForDisplay.length > 0 && (
              <button
                onClick={handleTransfer}
                disabled={selectedItems.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                Transfer Selected ({selectedItems.length})
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

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

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {modalTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Summary content remains the same... */}
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

                {factoryStats.totalItems && (
                 <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Factory Production Status</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                 <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                  <span className="text-sm font-bold text-green-600">{factoryStats.completionPercentage}%</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${factoryStats.completionPercentage}%` }}
                  ></div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 text-sm mt-7">
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
                               <div className="col-span-2 mt-4">
                                   <div className="bg-blue-50 rounded-lg">
                                       <div className="flex items-center justify-between mb-1">
                                           <span className="text-sm font-medium text-gray-700">Dispatched</span>
                                           <span className="text-sm font-bold text-blue-600">{dispatchedPercentage}%</span>
                                       </div>
                                       <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                           <div
                                               className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                               style={{ width: `${dispatchedPercentage}%` }}
                                           ></div>
                                       </div>
                                       <div className="text-center mt-4">
                                           <div className="font-bold text-blue-600">{factoryStats.dispatchedItems} / {factoryStats.completedItems}</div>
                                           <div className="text-gray-600">Dispatched / Completed</div>
                                       </div>
                                   </div>
                               </div>     
                            </div>
                      </div>
                )}
            </div>
          )}

          {modalTab === 'details' && (
            <div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input 
                          type="checkbox"
                          onChange={handleSelectAll}
                          // FIX: Updated logic for checked state
                          checked={selectedItems.length === dispatchableItems.length && dispatchableItems.length > 0}
                          disabled={dispatchableItems.length === 0}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatched Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transferred</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.values(orderItems.reduce((acc, item) => {
                      if (!acc[item.boxNumber]) {
                        acc[item.boxNumber] = {
                          boxNumber: item.boxNumber,
                          itemIds: [],
                          serialNumbers: [],
                          status: item.status, // Use the status of the first item for display
                          createdAt: item.createdAt,
                          dispatchedAt: null, // We'll find the latest date below
                          completedAt: null,  // We'll find the latest date below
                          isTransferredToProduct: true
                        };
                      }
                      // Update dates if a more recent one is found
                      if (item.dispatchedAt) acc[item.boxNumber].dispatchedAt = item.dispatchedAt;
                      if (item.completedAt) acc[item.boxNumber].completedAt = item.completedAt;
                      // If any item in the box is not transferred, the whole box is not
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
                              // FIX: Disable based on status, not boolean
                              disabled={groupedItem.status !== 'Dispatched' || groupedItem.isTransferredToProduct}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Box {groupedItem.boxNumber}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                            {groupedItem.serialNumbers.map(serial => <div key={serial}>{serial}</div>)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${groupedItem.status === 'Completed' ? 'bg-green-100 text-green-800' : groupedItem.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {groupedItem.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {new Date(groupedItem.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric'})}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {groupedItem.dispatchedAt ? new Date(groupedItem.dispatchedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {groupedItem.completedAt ? new Date(groupedItem.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {groupedItem.isTransferredToProduct ? 'Yes' : 'No'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}