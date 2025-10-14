import React, { useState } from 'react';
import { useProducts } from './hooks/useProducts';
import ProductList from './components/ProductList';
import DistributorSelectionModal from './components/DistributorSelectionModal'; // Import the new modal
import axios from 'axios'; // Import axios for API call
import { toast } from 'react-hot-toast'; // Import toast for notifications
import { Search } from 'lucide-react'; // Import Search icon

const API_URL = import.meta.env.VITE_API_URL; // Define API_URL

export default function Products() {
    const [modelFilter, setModelFilter] = useState(''); // State for model filter
    const { products, loading, fetchProducts } = useProducts(modelFilter); // Pass modelFilter to useProducts
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleProductSelect = (productId, isSelected) => {
        setSelectedProductIds(prev =>
            isSelected ? [...prev, productId] : prev.filter(id => id !== productId)
        );
    };

    const handleTransferClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleAssignProducts = async (distributorId) => {
        try {
            await axios.put(`${API_URL}/api/distributor/products/assign`, {
                productIds: selectedProductIds,
                distributorId: distributorId
            });
            toast.success('Products assigned successfully!');
        } catch (error) {
            toast.error('Error assigning products');
            console.error('Error assigning products:', error);
        } finally {
            handleCloseModal();
            setSelectedProductIds([]);
            fetchProducts(); // Refetch products to update UI
        }
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                            <p className="text-sm text-gray-600">Total {products.length}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by Model"
                                    value={modelFilter}
                                    onChange={(e) => setModelFilter(e.target.value)}
                                    className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleTransferClick}
                                disabled={selectedProductIds.length === 0}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${selectedProductIds.length > 0
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Transfer to Distributor ({selectedProductIds.length})
                            </button>
                        </div>
                    </div>
                </div>
                <ProductList
                    products={products}
                    loading={loading}
                    selectedProductIds={selectedProductIds}
                    onProductSelect={handleProductSelect}
                />

                <DistributorSelectionModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onAssign={handleAssignProducts}
                />
            </div>
        </div>
    );
}
