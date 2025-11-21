import React from 'react';
import { X } from 'lucide-react';

const WarrantyDetailsModal = ({ isOpen, onClose, onContinue, inWarranty, billingConfig }) => {
    if (!isOpen || !billingConfig) return null;

    const details = inWarranty ? {
        title: 'In-Warranty Service',
        serviceCharge: billingConfig.serviceCharge,
        replacementCharge: billingConfig.replacementCharge,
        tncUrl: billingConfig.termsAndConditionsUrl,
    } : {
        title: 'Out-of-Warranty Service',
        serviceCharge: billingConfig.outOfWarrantyServiceCharge,
        replacementCharge: billingConfig.outOfWarrantyReplacementCharge,
        tncUrl: billingConfig.outOfWarrantyTermsAndConditionsUrl,
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
                    <X size={24} />
                </button>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{details.title}</h3>
                
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Service Charge:</span>
                        <span className="font-bold text-lg text-indigo-600">₹{details.serviceCharge}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Replacement Charge:</span>
                        <span className="font-bold text-lg text-indigo-600">₹{details.replacementCharge}</span>
                    </div>
                </div>

                {details.tncUrl && (
                    <div className="mt-6">
                        <h4 className="font-semibold text-gray-700 mb-2">Terms & Conditions</h4>
                        <div className="border border-gray-200 rounded-lg p-2 h-70 overflow-y-auto bg-gray-50">
                            <iframe 
                                src={`${import.meta.env.VITE_API_URL}/${details.tncUrl.replace(/\\/g, "/")}`} 
                                title="Terms and Conditions"
                                className="w-full h-full border-0"
                            />
                        </div>
                        <a 
                            href={`${import.meta.env.VITE_API_URL}/${details.tncUrl.replace(/\\/g, "/")}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:underline mt-2 inline-block"
                        >
                            Open T&C in new tab
                        </a>
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-4">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onContinue} 
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarrantyDetailsModal;
