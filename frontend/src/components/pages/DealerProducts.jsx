import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DealerProductGroupList from './Dealers/components/DealerProductGroupList';
import DealerQRScannerModal from '../global/DealerQRScannerModal';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributor-dealer-products/dealer`;

export default function DealerProducts() {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScannerModal, setShowScannerModal] = useState(false);

    const fetchDealerProducts = async () => {
        if (!user || !user.dealer) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/${user.dealer._id}/products`);
            setProducts(response.data);
        } catch (error) {
            toast.error('Error fetching dealer products');
            console.error('Error fetching dealer products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDealerProducts();
    }, [user]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Products</h1>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowScannerModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Scan Product
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading products...</p>
                    </div>
                ) : (
                    <DealerProductGroupList products={products} />
                )}
            </div>
            <DealerQRScannerModal
                isOpen={showScannerModal}
                onClose={() => setShowScannerModal(false)}
                onProductAssigned={fetchDealerProducts}
            />
        </div>
    );
}
