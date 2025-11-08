import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!productDetails) {
        return <div>Product not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="p-8">
                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Product Details</div>
                    <h1 className="block mt-1 text-lg leading-tight font-medium text-black">{productDetails.model?.name}</h1>
                    <p className="mt-2 text-gray-500">Serial Number: {productDetails.serialNumber}</p>
                    <div className="mt-4">
                        <p><span className="font-semibold">Factory:</span> {productDetails.factory?.name}</p>
                        <p><span className="font-semibold">Manufacturing Date:</span> {new Date(productDetails.manufacturingDate).toLocaleDateString()}</p>
                        {productDetails.soldBy && (
                            <>
                                <p><span className="font-semibold">Sold By:</span> {productDetails.soldBy}</p>
                                <p><span className="font-semibold">Sale Date:</span> {new Date(productDetails.saleDate).toLocaleDateString()}</p>
                                <p><span className="font-semibold">Warranty Status:</span> {productDetails.warrantyStatus}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
