import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DistributorProductGroupList from '../Distributors/components/DistributorProductGroupList';
import DistributorQRScannerModal from '../../global/DistributorQRScannerModal';
import { ProductFilters } from '../Distributors/components/ProductFilters';
import { groupProductsByConfiguration } from '../Distributors/utils';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributors`;

export default function DistributorProducts() {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [factoryFilter, setFactoryFilter] = useState('all');
    const [modelFilter, setModelFilter] = useState('all');
    const [startSerialNumber, setStartSerialNumber] = useState('');
    const [endSerialNumber, setEndSerialNumber] = useState('');
    const [serialRangeActive, setSerialRangeActive] = useState(false);
    const [factories, setFactories] = useState([]);
    const [models, setModels] = useState([]);
    
    // Selection states
    const [selectedProductGroups, setSelectedProductGroups] = useState([]);

    const fetchProducts = async () => {
        if (!user || !user.distributor) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const [productsResponse, dealersResponse] = await Promise.all([
                axios.get(`${API_URL}/${user.distributor._id}/products`),
                axios.get(`${API_URL}/${user.distributor._id}/dealers`)
            ]);
            setProducts(productsResponse.data);
            setDealers(dealersResponse.data);
            
            // Extract unique factories and models from products
            const uniqueFactories = [...new Map(productsResponse.data
                .filter(p => p.factory)
                .map(p => [p.factory._id, p.factory])
            ).values()];
            
            const uniqueModels = [...new Map(productsResponse.data
                .filter(p => p.model)
                .map(p => [p.model._id, p.model])
            ).values()];
            
            setFactories(uniqueFactories);
            setModels(uniqueModels);
        } catch (error) {
            toast.error('Error fetching data');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [user]);
    
    const getSerialCounter = (serialNumber) => {
        if (!serialNumber) return 0;
        const match = serialNumber.match(/(\d+)$/);
        return match ? parseInt(match[1]) : 0;
    };

    // Filter products based on search term, factory, model, and serial number range
    const filteredProducts = products.filter(product => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
        const matchesSearch = (product.productName && product.productName.toLowerCase().includes(lowerCaseSearchTerm)) ||
                             (product.serialNumber && product.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)) ||
                             (product.model && product.model.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                             (product.factory && product.factory.name.toLowerCase().includes(lowerCaseSearchTerm));
        
        const matchesFactory = factoryFilter === 'all' || product.factory?._id === factoryFilter;
        const matchesModel = modelFilter === 'all' || product.model?._id === modelFilter;
        
        return matchesSearch && matchesFactory && matchesModel;
    });

    // Apply pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    
    const handleSelectRange = () => {
        if (!startSerialNumber || !endSerialNumber) {
            toast.error('Please enter both start and end serial numbers.');
            return;
        }
        const startCounter = getSerialCounter(startSerialNumber);
        const endCounter = getSerialCounter(endSerialNumber);
        if (startCounter === 0 || endCounter === 0 || startCounter > endCounter) {
            toast.error('Invalid serial number format or range.');
            return;
        }
        
        // Find products in the range and select them
        const groupedProducts = groupProductsByConfiguration(filteredProducts);
        
        const productsInRange = groupedProducts.filter(group => {
            return group.productsInBox.some(product => {
                const productCounter = getSerialCounter(product.serialNumber);
                return productCounter >= startCounter && productCounter <= endCounter;
            });
        });
        
        if (productsInRange.length === 0) {
            toast.error('No products found in the specified range.');
            return;
        }
        
        // Add to existing selection
        const newSelection = [...selectedProductGroups];
        productsInRange.forEach(group => {
            if (!newSelection.some(selected => selected._id === group._id)) {
                newSelection.push(group);
            }
        });
        
        setSelectedProductGroups(newSelection);
        toast.success(`Selected ${productsInRange.length} product groups in range`);
    };

    const handleClearRange = () => {
        setStartSerialNumber('');
        setEndSerialNumber('');
        setSerialRangeActive(false);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFactoryFilter('all');
        setModelFilter('all');
        handleClearRange();
        setSelectedProductGroups([]);
    };

    return (
        <div className="p-2 sm:p-6 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-3 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
                            <p className="text-sm text-gray-600">Total items: {filteredProducts.length}</p>
                        </div>
                        <button
                            onClick={() => setShowScannerModal(true)}
                            className="flex items-center justify-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <span>Scan Product</span>
                        </button>
                    </div>
                </div>
                
                {/* Filters */}
                <div className="p-3 sm:p-6 border-b border-gray-200">
                    <ProductFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        factoryFilter={factoryFilter}
                        onFactoryFilterChange={setFactoryFilter}
                        modelFilter={modelFilter}
                        onModelFilterChange={setModelFilter}
                        startSerialNumber={startSerialNumber}
                        onStartSerialNumberChange={setStartSerialNumber}
                        endSerialNumber={endSerialNumber}
                        onEndSerialNumberChange={setEndSerialNumber}
                        onSelectRange={handleSelectRange}
                        onClearRange={handleClearRange}
                        factories={factories}
                        models={models}
                        onClearFilters={clearFilters}
                    />
                </div>
                
                {/* Content */}
                <div className="relative min-h-[200px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading products...</p>
                        </div>
                    ) : (
                        <div className="p-4">
                            <DistributorProductGroupList 
                                products={currentItems} 
                                dealers={dealers} 
                                distributor={user.distributor}
                                selectedProductGroups={selectedProductGroups}
                                setSelectedProductGroups={setSelectedProductGroups}
                            />
                        </div>
                    )}
                </div>
                <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                    <div className="text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
                        <span>Rows per page:</span>
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="75">75</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <span className="text-sm text-gray-700 hidden sm:inline">
                            Showing {currentItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                        </span>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700 flex-shrink-0">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <DistributorQRScannerModal 
                isOpen={showScannerModal} 
                onClose={() => setShowScannerModal(false)}
                onProductAssigned={fetchProducts}
            />
        </div>
    );
}
