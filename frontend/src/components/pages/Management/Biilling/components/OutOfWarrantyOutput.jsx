import React, { useState, useEffect } from 'react';
import { FileText, Edit } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function OutOfWarrantyOutput({ onEdit, onConfigLoaded, refresh }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/billing-config`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConfig(res.data);
            onConfigLoaded(res.data); // Pass the fetched config to the parent
            setError(null);
        } catch (err) {
            console.error('Error fetching billing config:', err);
            toast.error('Failed to fetch billing configuration.');
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [refresh]); // Re-fetch when refresh prop changes

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md w-full mx-auto text-center">
                <p>Loading configuration...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md w-full mx-auto text-center text-red-600">
                <p>Error loading configuration. Please try again later.</p>
            </div>
        );
    }

    const serviceCharge = config?.outOfWarrantyServiceCharge || 0;
    const replacementCharge = config?.outOfWarrantyReplacementCharge || 0;
    const tncUrl = config?.outOfWarrantyTermsAndConditionsUrl ? `${import.meta.env.VITE_API_URL}/${config.outOfWarrantyTermsAndConditionsUrl}` : null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Out of Warranty Billing Details</h3>
                <button
                    onClick={onEdit}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                </button>
            </div>
            <div className="space-y-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">Service Charge</p>
                    <p className="text-lg font-semibold">₹{serviceCharge}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Replacement Charge</p>
                    <p className="text-lg font-semibold">₹{replacementCharge}</p>
                </div>
                {tncUrl && (
                    <div>
                        <p className="text-sm font-medium text-gray-500">Terms & Conditions</p>
                        <a
                            href={tncUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <FileText className="h-4 w-4 mr-1" />
                            View PDF
                        </a>
                    </div>
                )}
                 {!tncUrl && (
                    <div>
                        <p className="text-sm font-medium text-gray-500">Terms & Conditions</p>
                        <p className="text-md text-gray-600">No PDF uploaded.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
