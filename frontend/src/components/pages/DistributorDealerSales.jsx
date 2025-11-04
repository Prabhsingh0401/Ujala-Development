import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Box } from 'lucide-react';
import DealerProductGroupList from '../pages/Dealers/components/DealerProductGroupList';

const getStatusColor = (status) => {
    switch (status) {
        case 'Sold':
            return 'text-green-500';
        case 'Partially Sold':
            return 'text-yellow-500';
        case 'Not Sold':
            return 'text-red-500';
        default:
            return 'text-gray-500';
    }
};

function DealerSalesModal({ isOpen, onClose, dealer, dealerProducts }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Products for {dealer?.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="mt-4">
                    <DealerProductGroupList 
                        products={dealerProducts} 
                        onProductSelect={() => {}} 
                        selectedGroup={null}
                        hideCheckbox={true}
                    />
                </div>
            </div>
        </div>
    );
}

function DistributorDealerSales() {
    const [dealerSales, setDealerSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dealerProducts, setDealerProducts] = useState([]);

    useEffect(() => {
        const fetchDealerSales = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/sales/dealer-sales`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setDealerSales(response.data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error fetching dealer sales');
            } finally {
                setLoading(false);
            }
        };

        fetchDealerSales();
    }, []);

    const handleOpenModal = async (dealer) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/distributor-dealer-products/dealer/${dealer._id}/products`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDealerProducts(response.data);
            setSelectedDealer(dealer);
            setIsModalOpen(true);
        } catch (error) {
            toast.error('Error fetching dealer products');
            console.error('Error:', error);
        }
    };

    const handleCloseModal = () => {
        setSelectedDealer(null);
        setIsModalOpen(false);
    };

    const totalProductsSold = dealerSales.reduce((total, dealer) => total + (dealer.productCount || 0), 0);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Dealer Sales</h1>
            <h2 className="text-md mb-5">Total Products Sold to Dealers: {totalProductsSold}</h2>
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading dealer sales...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealer Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products Assigned</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dealerSales.map(dealer => (
                                <tr key={dealer._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dealer.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleOpenModal(dealer)}
                                            className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                                        >
                                            <Box className="h-4 w-4 mr-1" />
                                            {dealer.productCount || 0} Products
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <DealerSalesModal isOpen={isModalOpen} onClose={handleCloseModal} dealer={selectedDealer} dealerProducts={dealerProducts} />
        </div>
    );
}

export default DistributorDealerSales;