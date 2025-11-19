import React from 'react';
import { groupProductsByConfiguration, getOrderTypeDisplay } from '../../Distributors/utils';

export default function DealerProductGroupList({ products, selectedProductGroups = [], setSelectedProductGroups, hideCheckbox = false }) {
    // Map products with distributor name for easier access
    const productsWithDistributor = products.map(item => ({
        ...item.product,
        distributorName: item.distributor?.name || 'N/A',
    }));

    // Group products based on configuration
    const groupedProducts = groupProductsByConfiguration(productsWithDistributor);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProductGroups(groupedProducts.filter(g => !g.productsInBox.every(p => p.sold)));
        } else {
            setSelectedProductGroups([]);
        }
    };

    const handleSelectRow = (e, productGroup) => {
        if (e.target.checked) {
            setSelectedProductGroups([...selectedProductGroups, productGroup]);
        } else {
            setSelectedProductGroups(selectedProductGroups.filter(group => group._id !== productGroup._id));
        }
    };

    // If no products found, show empty message
    if (!groupedProducts || groupedProducts.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No products found for this dealer
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {!hideCheckbox && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input type="checkbox" onChange={handleSelectAll} />
                            </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Numbers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                    {groupedProducts.map((group) => {
                        const orderTypeInfo = getOrderTypeDisplay(group.orderType);
                        const firstProduct = group.productsInBox?.[0];
                        const isSelected = selectedProductGroups.some(g => g._id === group._id);
                        const allSold = group.productsInBox.every(p => p.sold);
                        const partiallySold = group.productsInBox.some(p => p.sold) && !allSold;

                        return (
                            <tr
                                key={group._id}
                                className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-100' : ''} ${allSold ? 'bg-gray-100' : ''}`}
                            >
                                {!hideCheckbox && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => handleSelectRow(e, group)}
                                            disabled={allSold}
                                        />
                                    </td>
                                )}

                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {group.productName}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${orderTypeInfo.bgColor} ${orderTypeInfo.textColor}`}
                                    >
                                        {orderTypeInfo.label}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {group.productsInBox?.map((product) => (
                                        <div key={product._id}>{product.serialNumber}</div>
                                    ))}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {firstProduct?.distributorName || 'N/A'}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            allSold
                                                ? 'bg-red-100 text-red-800'
                                                : partiallySold
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : firstProduct?.status === 'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {allSold ? 'Sold' : partiallySold ? 'Partially Sold' : firstProduct?.status}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}