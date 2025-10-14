import React from 'react';
import { groupProductsByConfiguration, getOrderTypeDisplay } from '../utils';

export default function DistributorProductGroupList({ products }) {
    const groupedProducts = groupProductsByConfiguration(products);

    if (groupedProducts.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No products found for this distributor
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Numbers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {groupedProducts.map((group) => (
                        <tr
                            key={group._id}
                            className="hover:bg-gray-50"
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.productName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderTypeDisplay(group.orderType).bgColor} ${getOrderTypeDisplay(group.orderType).textColor}`}>
                                    {getOrderTypeDisplay(group.orderType).label}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {group.productsInBox.map(product => (
                                    <div key={product._id}>{product.serialNumber}</div>
                                ))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{group.category?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{group.model?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{group.factory?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    group.productsInBox[0]?.status === 'Active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {group.productsInBox[0]?.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
