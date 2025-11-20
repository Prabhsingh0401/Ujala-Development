import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function EditOutOfWarranty({ onClose, currentConfig, onSaveSuccess }) {
    const [serviceCharge, setServiceCharge] = useState(currentConfig?.outOfWarrantyServiceCharge || 0);
    const [replacementCharge, setReplacementCharge] = useState(currentConfig?.outOfWarrantyReplacementCharge || 0);
    const [tncFile, setTncFile] = useState(null);
    const [existingTncUrl, setExistingTncUrl] = useState(currentConfig?.outOfWarrantyTermsAndConditionsUrl || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        setTncFile(e.target.files[0]);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('outOfWarrantyServiceCharge', serviceCharge);
        formData.append('outOfWarrantyReplacementCharge', replacementCharge);
        if (tncFile) {
            formData.append('outOfWarrantyTermsAndConditions', tncFile);
        } else if (existingTncUrl === '') {
            // Explicitly tell backend to clear PDF if it was removed by user
            formData.append('clearPdf', 'true');
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/billing-config/out-of-warranty`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Out of Warranty billing configuration updated successfully!');
            onSaveSuccess(res.data); // Pass updated config back to parent
            onClose();
        } catch (error) {
            console.error('Error updating out of warranty billing config:', error);
            toast.error(error.response?.data?.message || 'Failed to update out of warranty billing configuration.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl transform transition-all sm:my-8 sm:max-w-lg w-full">
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Edit Out of Warranty Billing
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="px-8 py-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Service Charge</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">₹</span>
                                </div>
                                <input
                                    type="number"
                                    value={serviceCharge}
                                    onChange={(e) => setServiceCharge(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Replacement Charge</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">₹</span>
                                </div>
                                <input
                                    type="number"
                                    value={replacementCharge}
                                    onChange={(e) => setReplacementCharge(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Terms & Conditions (PDF)</label>
                            {existingTncUrl && !tncFile ? (
                                <div className="mt-2 flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}/${existingTncUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Current PDF
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setExistingTncUrl('')} // Clear existing TNC
                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                        title="Remove current PDF"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                            >
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                                        {tncFile && <p className="text-sm text-gray-600 mt-2">{tncFile.name}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-8 py-4 sm:flex sm:flex-row-reverse rounded-b-2xl">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center ml-2 rounded-lg border border-transparent shadow-sm px-6 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Save'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
