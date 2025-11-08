import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Package, MapPin, Calendar, User, Building, Shield, Clock, Phone, Mail } from 'lucide-react';

const ProductDetails = () => {
    const { serialNumber } = useParams();
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await axios.get(`/api/qr/${serialNumber}`);
                setProductDetails(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [serialNumber]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-12 text-red-500">Error: {error}</div>;
    }

    if (!productDetails) {
        return <div className="text-center py-12 text-gray-500">Product not found</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center space-x-4 mb-6">
                            <Package className="h-10 w-10 text-indigo-500" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{productDetails.model?.name}</h1>
                                <p className="text-sm text-gray-500">Serial Number: {productDetails.serialNumber}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Manufacturing Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Building className="h-5 w-5 mr-2 text-gray-500" />
                                    Manufacturing Details
                                </h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600">Factory:</span>
                                        <span className="text-gray-800">{productDetails.factory?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600">Manufacturing Date:</span>
                                        <span className="text-gray-800">{new Date(productDetails.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Warranty Status */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Shield className="h-5 w-5 mr-2 text-gray-500" />
                                    Warranty Status
                                </h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600">Status:</span>
                                        <span className={`font-semibold ${productDetails.warrantyStatus === 'Under Warranty' ? 'text-green-600' : 'text-red-600'}`}>
                                            {productDetails.warrantyStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Distributor Details */}
                            {productDetails.distributor && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <User className="h-5 w-5 mr-2 text-gray-500" />
                                        Distributor
                                    </h2>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600">Name:</span>
                                            <span className="text-gray-800">{productDetails.distributor.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600">Location:</span>
                                            <span className="text-gray-800 flex items-center">
                                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                                {productDetails.distributor.city}, {productDetails.distributor.state}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dealer Details */}
                            {productDetails.dealer && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <User className="h-5 w-5 mr-2 text-gray-500" />
                                        Dealer
                                    </h2>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600">Name:</span>
                                            <span className="text-gray-800">{productDetails.dealer.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600">Location:</span>
                                            <span className="text-gray-800 flex items-center">
                                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                                {productDetails.dealer.city}, {productDetails.dealer.state}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sale Details */}
                            {productDetails.sale && (
                                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                                        Sale Details
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div className="flex justify-between sm:flex-col">
                                            <span className="font-medium text-gray-600">Customer Name:</span>
                                            <span className="text-gray-800">{productDetails.sale.customerName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between sm:flex-col">
                                            <span className="font-medium text-gray-600">Sale Date:</span>
                                            <span className="text-gray-800">{new Date(productDetails.sale.soldAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between sm:flex-col">
                                            <span className="font-medium text-gray-600">Customer Phone:</span>
                                            <span className="text-gray-800 flex items-center">
                                                <Phone className="h-4 w-4 mr-1 text-gray-400" />
                                                {productDetails.sale.customerPhone || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between sm:flex-col">
                                            <span className="font-medium text-gray-600">Customer Email:</span>
                                            <span className="text-gray-800 flex items-center">
                                                <Mail className="h-4 w-4 mr-1 text-gray-400" />
                                                {productDetails.sale.customerEmail || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
