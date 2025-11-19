import React, { useState, useEffect, useCallback } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

// Simple debounce function
const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

export default function FactoryModal({ isOpen, onClose, onSave, factory, isEditing, isSaving }) {
    const [newFactory, setNewFactory] = useState({
        name: '',
        code: '',
        location: '',
        contactPerson: '',
        contactPhone: '',
        gstNumber: '',
        address: '',
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [codeError, setCodeError] = useState('');
    const [isCheckingCode, setIsCheckingCode] = useState(false);

    const checkCodeUniqueness = useCallback(
        debounce(async (code) => {
            if (!code || isEditing) { // Don't check uniqueness if editing or code is empty
                setCodeError('');
                setIsCheckingCode(false);
                return;
            }
            setIsCheckingCode(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/factories/check-code/${code}`);
                if (!response.data.isUnique) {
                    setCodeError('This code is already in use.');
                } else {
                    setCodeError('');
                }
            } catch (error) {
                console.error('Error checking code uniqueness:', error);
                setCodeError('Error checking code uniqueness.');
            } finally {
                setIsCheckingCode(false);
            }
        }, 500),
        [isEditing]
    );

    useEffect(() => {
        if (isEditing && factory) {
            setNewFactory({
                ...factory,
                username: factory.username || '', // Ensure username is set
                password: '' // Always clear password field for security
            });
            setCodeError(''); // Clear error when editing
        } else {
            setNewFactory({
                name: '',
                code: '',
                location: '',
                contactPerson: '',
                contactPhone: '',
                gstNumber: '',
                address: '',
                username: '',
                password: ''
            });
            setCodeError(''); // Clear error when adding new
        }
    }, [isEditing, factory, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (codeError || isCheckingCode) {
            return; // Prevent submission if there's a code error or still checking
        }
        onSave(newFactory);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {isEditing ? 'Edit Factory' : 'Add New Factory'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['name', 'code', 'location', 'contactPerson', 'contactPhone', 'gstNumber', 'address'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newFactory[field]}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setNewFactory({ ...newFactory, [field]: value });
                                        if (field === 'code') {
                                            checkCodeUniqueness(value);
                                        }
                                    }}
                                    placeholder={field === 'code' ? 'Enter unique factory code (e.g., F1, F2)' : `Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent ${field === 'code' && codeError ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {field === 'code' && codeError && (
                                    <p className="text-red-500 text-sm mt-1">{codeError}</p>
                                )}
                                {field === 'code' && isCheckingCode && (
                                    <p className="text-gray-500 text-sm mt-1">Checking code uniqueness...</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Login Credentials</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newFactory.username || ''}
                                        onChange={(e) => setNewFactory({ ...newFactory, username: e.target.value })}
                                        placeholder="Enter username for factory login"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-gray-100"
                                        readOnly={isEditing}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password {isEditing ? '' : '*'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required={!isEditing}
                                            value={newFactory.password}
                                            onChange={(e) => setNewFactory({ ...newFactory, password: e.target.value })}
                                            placeholder={isEditing ? "Leave blank to keep current password" : "Enter password for factory login"}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={codeError || isCheckingCode || isSaving}
                            className="w-full px-6 py-3 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                            ) : (
                                isEditing ? 'Update Factory' : 'Add Factory'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
