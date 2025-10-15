import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

export default function FactoryModal({ isOpen, onClose, onSave, factory, isEditing }) {
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

    useEffect(() => {
        if (isEditing && factory) {
            setNewFactory(factory);
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
        }
    }, [isEditing, factory, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
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
                                    onChange={(e) => setNewFactory({ ...newFactory, [field]: e.target.value })}
                                    placeholder={field === 'code' ? 'Enter unique factory code (e.g., F1, F2)' : `Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                />
                            </div>
                        ))}
                    </div>

                    {!isEditing && (
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
                                        value={newFactory.username}
                                        onChange={(e) => setNewFactory({ ...newFactory, username: e.target.value })}
                                        placeholder="Enter username for factory login"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={newFactory.password}
                                            onChange={(e) => setNewFactory({ ...newFactory, password: e.target.value })}
                                            placeholder="Enter password for factory login"
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
                    )}

                    <div className="mt-8">
                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors font-medium cursor-pointer"
                        >
                            {isEditing ? 'Update Factory' : 'Add Factory'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
