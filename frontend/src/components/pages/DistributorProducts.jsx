import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { groupProductsByConfiguration, getOrderTypeDisplay } from './Distributors/utils';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributor/products`;

export default function DistributorProducts() {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDistributorProducts = async () => {
            if (!user || !user.distributor) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/${user.distributor._id}`);
                setProducts(response.data);
            } catch (error) {
                toast.error('Error fetching distributor products');
                console.error('Error fetching distributor products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDistributorProducts();
    }, [user]);

    const groupedProducts = groupProductsByConfiguration(products);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="p-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Products</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {groupedProducts.length > 0 ? (
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
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No products assigned to this distributor.
                    </div>
                )}
            </div>
        </div>
    );
}
