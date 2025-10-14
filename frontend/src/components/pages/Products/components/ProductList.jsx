import { getOrderTypeDisplay } from '../utils.js';

export default function ProductList({ products, loading, selectedProductIds, onProductSelect }) {
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-8 py-4 w-12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center justify-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={products.length > 0 && products.every(groupedProduct =>
                                    groupedProduct.productsInBox.every(product =>
                                        !!product.distributor || selectedProductIds.includes(product._id)
                                    )
                                )}
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    products.forEach(groupedProduct => {
                                        groupedProduct.productsInBox.forEach(product => {
                                            if (!product.distributor) { // Only toggle if not already assigned
                                                onProductSelect(product._id, isChecked);
                                            }
                                        });
                                    });
                                }}
                            />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Numbers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((groupedProduct) => (
                        <tr
                            key={groupedProduct._id}
                            className={`hover:bg-gray-50 ${groupedProduct.productsInBox.some(p => p.distributor) ? 'bg-gray-100' : ''}`}
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                    checked={groupedProduct.productsInBox.every(product => selectedProductIds.includes(product._id))}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        groupedProduct.productsInBox.forEach(product => {
                                            if (!product.distributor) { // Only toggle if not already assigned
                                                onProductSelect(product._id, isChecked);
                                            }
                                        });
                                    }}
                                    disabled={groupedProduct.productsInBox.every(product => !!product.distributor)} // Disable if all products in box are assigned
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{groupedProduct.productName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderTypeDisplay(groupedProduct.orderType).bgColor} ${getOrderTypeDisplay(groupedProduct.orderType).textColor}`}>
                                    {getOrderTypeDisplay(groupedProduct.orderType).label}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {groupedProduct.productsInBox.map(product => (
                                    <div key={product._id}>{product.serialNumber}</div>
                                ))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{groupedProduct.category?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{groupedProduct.model?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{groupedProduct.price} /- Each</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{groupedProduct.factory?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {groupedProduct.productsInBox[0]?.distributor ? groupedProduct.productsInBox[0].distributor.name : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${groupedProduct.productsInBox[0]?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {groupedProduct.productsInBox[0]?.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}