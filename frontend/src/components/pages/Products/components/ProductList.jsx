import { getOrderTypeDisplay } from '../utils.js';
import '../../Distributors/components/TableList.css';
import ExportToExcelButton from '../../../global/ExportToExcelButton'; // Import the new components
import ExportToPdfButton from '../../../global/ExportToPdfButton'; // Import the new components

export default function ProductList({
    products,
    loading,
    selectedProductIds,
    onProductSelect,
    startSerialNumber,
    endSerialNumber,
    onStartSerialChange,
    onEndSerialChange,
    onSelectRange,
    onUnselectRange,
    onClearSelection,
    factoryFilter,
    onFactoryFilterChange,
    factories,
    boxTypeFilter,
    onBoxTypeFilterChange
}) {
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
        );
    }

    const productColumns = [
        { header: 'Model', accessor: 'Model' },
        { header: 'Box Type', accessor: 'Box Type' },
        { header: 'Serial Numbers', accessor: 'Serial Numbers' },
        { header: 'MRP(Price)', accessor: 'MRP(Price)' },
        { header: 'Factory', accessor: 'Factory' },
        { header: 'Distributor', accessor: 'Distributor' },
    ];

    const getExportData = () => {
        return products.map(groupedProduct => ({
            'Model': groupedProduct.productName,
            'Box Type': `${groupedProduct.productsInBox[0]?.unitsPerBox}N`,
            'Serial Numbers': groupedProduct.productsInBox.map(p => p.serialNumber).join(', '),
            'MRP(Price)': `${groupedProduct.price} /- Each`,
            'Factory': groupedProduct.factory?.name || 'N/A',
            'Distributor': groupedProduct.productsInBox[0]?.distributor?.name || 'N/A',
        }));
    };

    return (
        <div className="overflow-x-auto">
            {/* Controls */}
            <div className="bg-white rounded-lg p-2 mb-3">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* Filter Section - Left Side */}
                    <div className="lg:col-span-12 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Factory</label>
                                <select
                                    value={factoryFilter}
                                    onChange={(e) => onFactoryFilterChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">All Factories</option>
                                    {factories?.map(factory => (
                                        <option key={factory._id} value={factory._id}>
                                            {factory.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Box Type</label>
                                <select
                                    value={boxTypeFilter}
                                    onChange={(e) => onBoxTypeFilterChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">All</option>
                                    <option value="1">1N</option>
                                    <option value="2">2N</option>
                                    <option value="3">3N</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                            {/* Serial Number Range - Middle */}
                            <div className="lg:col-span-8 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Serial</label>
                                    <input
                                        type="text"
                                        placeholder="Enter start serial"
                                        value={startSerialNumber}
                                        onChange={(e) => onStartSerialChange(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Serial</label>
                                    <input
                                        type="text"
                                        placeholder="Enter end serial"
                                        value={endSerialNumber}
                                        onChange={(e) => onEndSerialChange(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons - Right Side */}
                            <div className="lg:col-span-4 flex flex-col gap-2 justify-end">
                                <div className="flex gap-2">
                                    <button
                                        onClick={onSelectRange}
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors shadow-sm"
                                        title="Select Range"
                                    >
                                        Select Range
                                    </button>
                                    <button
                                        onClick={onUnselectRange}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors shadow-sm"
                                        title="Unselect Range"
                                    >
                                        Unselect Range
                                    </button>
                                </div>
                                <button
                                    onClick={onClearSelection}
                                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
                                    title="Clear Selection"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                                <ExportToExcelButton
                                    getData={getExportData}
                                    filename="products-export"
                                />
                                <ExportToPdfButton
                                    getData={getExportData}
                                    columns={productColumns}
                                    filename="products-export"
                                />
                        </div>
                    </div>
                </div>
            </div>
            {/* Product Table */}
            <table className="min-w-full divide-y divide-gray-200 responsive-table">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-4 w-12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={(() => {
                                    const availableProducts = products
                                        .flatMap(g => g.productsInBox)
                                        .filter(p => !p.distributor);
                                    return (
                                        availableProducts.length > 0 &&
                                        availableProducts.every(p =>
                                            selectedProductIds.includes(p._id)
                                        )
                                    );
                                })()}
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    const availableProductIds = products
                                        .flatMap(g => g.productsInBox)
                                        .filter(p => !p.distributor)
                                        .map(p => p._id);
                                    onProductSelect(availableProductIds, isChecked);
                                }}
                            />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Numbers</th>
                        {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th> */}
                        {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th> */}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP(Price)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
                        {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((groupedProduct) => (
                        <tr
                            key={groupedProduct._id}
                            className={`hover:bg-gray-50 ${
                                groupedProduct.productsInBox.some(p => p.distributor)
                                    ? 'bg-gray-100'
                                    : ''
                            }`}
                        >
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium" data-label="Select">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                    checked={groupedProduct.productsInBox.every(product =>
                                        selectedProductIds.includes(product._id)
                                    )}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        const productIdsInBox = groupedProduct.productsInBox
                                            .filter(p => !p.distributor)
                                            .map(p => p._id);
                                        onProductSelect(productIdsInBox, isChecked);
                                    }}
                                    disabled={groupedProduct.productsInBox.every(
                                        product => !!product.distributor
                                    )}
                                />
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-label="Product Name">
                                {groupedProduct.productName}
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-label="Box Type">
                                {groupedProduct.productsInBox[0]?.unitsPerBox}N
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-label="Serial Numbers">
                                {groupedProduct.productsInBox.map(product => (
                                    <div key={product._id}>{product.serialNumber}</div>
                                ))}
                            </td>

                            {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-label="Category">
                                {groupedProduct.category?.name}
                            </td> */}

                            {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-label="Model">
                                {groupedProduct.model?.name}
                            </td> */}

                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-label="Price">
                                {groupedProduct.price} /- Each
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-label="Factory">
                                {groupedProduct.factory?.name}
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-label="Distributor">
                                {groupedProduct.productsInBox[0]?.distributor
                                    ? groupedProduct.productsInBox[0].distributor.name
                                    : 'N/A'}
                            </td>

                            {/* <td className="px-4 py-4 whitespace-nowrap" data-label="Status">
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        groupedProduct.productsInBox[0]?.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {groupedProduct.productsInBox[0]?.status}
                                </span>
                            </td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
