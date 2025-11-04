import React, { useState } from 'react';
import { X } from 'lucide-react';
import { groupProductsByConfiguration, getOrderTypeDisplay } from '../utils';
import { distributorDealerProductService } from '../../../../services/distributorDealerProductService';
import { toast } from 'react-hot-toast';
import './TableList.css';

export default function DistributorProductGroupList({ products, dealers, distributor, selectedProductGroups = [], setSelectedProductGroups }) {
    const groupedProducts = groupProductsByConfiguration(products);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState('');

    const handleAssignClick = (productGroups) => {
        setSelectedProductGroups(productGroups);
        setShowAssignModal(true);
    };

    const handleAssign = async () => {
        if (!selectedDealer) {
            toast.error('Please select a dealer');
            return;
        }

        try {
            for (const group of selectedProductGroups) {
                for (const product of group.productsInBox) {
                    await distributorDealerProductService.assignProductToDealer({
                        distributorId: distributor._id,
                        dealerId: selectedDealer,
                        productId: product._id
                    });
                }
            }
            toast.success('Products assigned successfully');
            setShowAssignModal(false);
            if (setSelectedProductGroups) setSelectedProductGroups([]);
            setSelectedDealer('');
        } catch (error) {
            toast.error('Error assigning products');
            console.error('Error:', error);
        }
    };

    const handleSelectAll = (e) => {
        if (!setSelectedProductGroups) return;
        if (e.target.checked) {
            setSelectedProductGroups(groupedProducts);
        } else {
            setSelectedProductGroups([]);
        }
    };

    const handleSelectRow = (e, productGroup) => {
        if (!setSelectedProductGroups) return;
        if (e.target.checked) {
            setSelectedProductGroups([...selectedProductGroups, productGroup]);
        } else {
            setSelectedProductGroups(selectedProductGroups.filter(group => group._id !== productGroup._id));
        }
    };

    if (groupedProducts.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No products found for this distributor
            </div>
        );
    }

    return (
        <>
            {selectedProductGroups && selectedProductGroups.length > 0 && (
                <div className="mb-4">
                    <button
                        onClick={() => handleAssignClick(selectedProductGroups)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4d55f5] hover:bg-[#3d45e5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4d55f5]"
                    >
                        Assign Selected ({selectedProductGroups.length})
                    </button>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 responsive-table">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input type="checkbox" onChange={handleSelectAll} />
                            </th> */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Numbers</th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th> */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned to</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {groupedProducts.map((group) => {
                            const isAssigned = group.productsInBox.some(p => p.assignedTo);
                            return (
                                <tr
                                    key={group._id}
                                    className={`hover:bg-gray-50 ${isAssigned ? 'bg-gray-100 text-gray-500' : ''}`}
                                >
                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-label="Select">
                                        <input type="checkbox" onChange={(e) => handleSelectRow(e, group)} checked={selectedProductGroups && selectedProductGroups.some(g => g._id === group._id)} disabled={isAssigned} />
                                    </td> */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" data-label="Product Name">{group.productName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm" data-label="Box Type">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderTypeDisplay(group.orderType).bgColor} ${getOrderTypeDisplay(group.orderType).textColor}`}>
                                            {getOrderTypeDisplay(group.orderType).label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm" data-label="Serial Numbers">
                                        {group.productsInBox.map(product => (
                                            <div key={product._id}>{product.serialNumber}</div>
                                        ))}
                                    </td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm" data-label="Category">{group.category?.name}</td> */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm" data-label="Model">{group.model?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm" data-label="Factory">{group.factory?.name}</td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap" data-label="Status">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            group.productsInBox[0]?.status === 'Active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {group.productsInBox[0]?.status}
                                        </span>
                                    </td> */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm" data-label="Assigned to">
                                        {isAssigned ? group.productsInBox[0].assignedTo : 'Not Assigned'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {showAssignModal && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Assign {selectedProductGroups.length} Product Groups to Dealer
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    if (setSelectedProductGroups) setSelectedProductGroups([]);
                                    setSelectedDealer('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="mt-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Dealer</label>
                                <select
                                    value={selectedDealer}
                                    onChange={(e) => setSelectedDealer(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                >
                                    <option value="">Select a dealer</option>
                                    {dealers.map(dealer => (
                                        <option key={dealer._id} value={dealer._id}>{dealer.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleAssign}
                                className="w-full px-6 py-3 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors font-medium"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
