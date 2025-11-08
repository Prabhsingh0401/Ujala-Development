import React, { useState, useEffect, useMemo } from 'react';
import { Search, Package, MapPin, Calendar, User, Building, Shield, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SaleFilters } from './components/SaleFilters';

const API_URL = import.meta.env.VITE_API_URL;

export default function Sales() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [distributorFilter, setDistributorFilter] = useState('all');
    const [factoryFilter, setFactoryFilter] = useState('all');
    const [serialNumber, setSerialNumber] = useState('');
    const [modelFilter, setModelFilter] = useState('all');
    const [dealerFilter, setDealerFilter] = useState('all');

    useEffect(() => {
        fetchSalesData();
    }, []);

    const fetchSalesData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);
            if (distributorFilter !== 'all') params.append('distributor', distributorFilter);
            if (factoryFilter !== 'all') params.append('factory', factoryFilter);
            if (serialNumber) params.append('serialNumber', serialNumber);
            if (modelFilter !== 'all') params.append('model', modelFilter);
            if (dealerFilter !== 'all') params.append('dealer', dealerFilter);

            const response = await axios.get(`${API_URL}/api/sales/assigned-products?${params.toString()}`);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching sales data:', error);
            toast.error('Failed to fetch sales data');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const searchLower = searchTerm.toLowerCase();
            const matchSearch = (
                product.model?.name?.toLowerCase().includes(searchLower) ||
                product.serialNumber?.toLowerCase().includes(searchLower) ||
                product.distributor?.name?.toLowerCase().includes(searchLower) ||
                product.dealer?.name?.toLowerCase().includes(searchLower) ||
                product.subDealer?.name?.toLowerCase().includes(searchLower) ||
                product.factory?.name?.toLowerCase().includes(searchLower)
            );

            const matchDate = 
                (!dateRange.startDate || new Date(product.assignedToDistributorAt) >= new Date(dateRange.startDate)) &&
                (!dateRange.endDate || new Date(product.assignedToDistributorAt) <= new Date(dateRange.endDate));

            const matchDistributor = distributorFilter === 'all' || product.distributor?._id === distributorFilter;
            const matchFactory = factoryFilter === 'all' || product.factory?._id === factoryFilter;
            const matchSerialNumber = !serialNumber || product.serialNumber?.toLowerCase().includes(serialNumber.toLowerCase());
            const matchModel = modelFilter === 'all' || product.model?._id === modelFilter;
            const matchDealer = dealerFilter === 'all' || product.dealer?._id === dealerFilter;

            return matchSearch && matchDate && matchDistributor && matchFactory && matchSerialNumber && matchModel && matchDealer;
        });
    }, [products, searchTerm, dateRange, distributorFilter, factoryFilter, serialNumber, modelFilter, dealerFilter]);

    const totalPages = useMemo(() => Math.ceil(filteredProducts.length / itemsPerPage) || 1, [filteredProducts, itemsPerPage]);
    const paginatedProducts = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const getWarrantyInfo = (product) => {
        if (!product.model?.warranty || !product.distributor) {
            return { status: 'No Warranty Info', remaining: 'N/A', color: 'text-gray-500' };
        }

        const distributorState = product.distributor.state;
        const distributorCity = product.distributor.city;
        
        const warrantyConfig = product.model.warranty.find(w => 
            w.state.toLowerCase() === distributorState.toLowerCase() && 
            w.city.toLowerCase() === distributorCity.toLowerCase()
        ) || product.model.warranty.find(w => 
            w.state.toLowerCase() === distributorState.toLowerCase()
        );

        if (!warrantyConfig) {
            return { status: 'No Warranty Config', remaining: 'N/A', color: 'text-gray-500' };
        }

        if (!product.sold) {
            return { status: 'Not Yet Sold', remaining: 'Warranty starts on sale', color: 'text-orange-500' };
        }

        // Calculate warranty expiry
        const saleDate = new Date(product.saleDate);
        const warrantyDuration = warrantyConfig.duration;
        const durationType = warrantyConfig.durationType;
        
        const expiryDate = new Date(saleDate);
        if (durationType === 'Years') {
            expiryDate.setFullYear(expiryDate.getFullYear() + warrantyDuration);
        } else {
            expiryDate.setMonth(expiryDate.getMonth() + warrantyDuration);
        }

        const now = new Date();
        const timeRemaining = expiryDate - now;
        
        if (timeRemaining <= 0) {
            return { status: 'Expired', remaining: 'Warranty expired', color: 'text-red-500' };
        }

        const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
        const monthsRemaining = Math.floor(daysRemaining / 30);
        
        let remainingText;
        if (monthsRemaining > 0) {
            remainingText = `${monthsRemaining} months remaining`;
        } else {
            remainingText = `${daysRemaining} days remaining`;
        }

        return { 
            status: 'Active', 
            remaining: remainingText, 
            color: daysRemaining > 30 ? 'text-green-500' : 'text-yellow-500' 
        };
    };

    if (loading) {
        return (
            <div className="p-4 lg:p-4 min-h-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-4 min-h-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 lg:p-6">
                    <div className="space-y-4">
                        <div className="flex-shrink-0">
                            <h2 className="text-lg font-semibold text-gray-900">Sales</h2>
                            <p className="text-sm text-gray-600">Products assigned to distributors: {filteredProducts.length}</p>
                        </div>
                        <SaleFilters
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            dateRange={dateRange}
                            onDateRangeChange={setDateRange}
                            distributorFilter={distributorFilter}
                            onDistributorFilterChange={setDistributorFilter}
                            factoryFilter={factoryFilter}
                            onFactoryFilterChange={setFactoryFilter}
                            serialNumber={serialNumber}
                            onSerialNumberChange={setSerialNumber}
                            modelFilter={modelFilter}
                            onModelFilterChange={setModelFilter}
                            dealerFilter={dealerFilter}
                            onDealerFilterChange={setDealerFilter}
                            onClearFilters={() => {
                                setSearchTerm('');
                                setDateRange({ startDate: '', endDate: '' });
                                setDistributorFilter('all');
                                setFactoryFilter('all');
                                setSerialNumber('');
                                setModelFilter('all');
                                setDealerFilter('all');
                            }}
                        />
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>No products assigned to distributors found.</p>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Dealer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedProducts.map((product) => {
                                        const warrantyInfo = getWarrantyInfo(product);
                                        return (
                                            <tr key={product._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {product.model?.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.serialNumber}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 text-gray-400 mr-2" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {product.distributor?.name || 'N/A'}
                                                            </div>
                                                            <div className="text-xs text-gray-500 flex items-center">
                                                                <MapPin className="h-3 w-3 mr-1" />
                                                                {product.distributor?.city}, {product.distributor?.state}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {product.sale ? (
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{product.sale.customerName || '-'}</span>
                                                                    <span className="text-xs text-gray-500">{product.sale.customerPhone || '-'}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-500">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                        {product.assignedToDistributorAt ? 
                                                            new Date(product.assignedToDistributorAt).toLocaleDateString() : 
                                                            'N/A'
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-900">
                                                            {product.dealer?.name || 'NA'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-900">
                                                            {product.subDealer?.name || 'NA'}
                                                        </span>
                                                </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-900">
                                                            {product.factory?.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className={`text-sm font-medium ${warrantyInfo.color}`}>
                                                            {warrantyInfo.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className={`text-sm ${warrantyInfo.color}`}>
                                                            {warrantyInfo.remaining}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Rows per page:
                                <select
                                    className="ml-2 border border-gray-300 rounded px-2 py-1"
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">
                                    Showing {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
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
                )}
            </div>
        </div>
    );
}