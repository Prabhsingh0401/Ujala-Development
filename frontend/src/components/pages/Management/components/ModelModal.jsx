import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ModelModal({ isOpen, onClose, onSave, model, isEditing, categories }) {
    const [formData, setFormData] = useState({
        name: '', code: '', category: '',
        specifications: { grossWeight: '', kwHp: '', voltage: '220V', mrpPrice: '' },
        status: 'Active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (isEditing && model) {
                setFormData({
                    name: model.name || '',
                    code: model.code || '',
                    category: model.category?._id || '',
                    specifications: {
                        grossWeight: model.specifications?.grossWeight || '',
                        kwHp: model.specifications?.kwHp || '',
                        voltage: model.specifications?.voltage || '220V',
                        mrpPrice: model.specifications?.mrpPrice || ''
                    },
                    status: model.status || 'Active'
                });
            } else {
                setFormData({
                    name: '', code: '', category: '',
                    specifications: { grossWeight: '', kwHp: '', voltage: '220V', mrpPrice: '' },
                    status: 'Active'
                });
            }
        }
    }, [isOpen, isEditing, model]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await onSave(formData);
        setLoading(false);
        if (success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {isEditing ? 'Edit Model' : 'Add Model'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., A, B, AA, AB"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.filter(cat => cat.status === 'Active').map((category) => (
                                    <option key={category._id} value={category._id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Specifications</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gross Weight</label>
                        <input
                            type="text"
                            value={formData.specifications.grossWeight}
                            onChange={(e) => setFormData({ ...formData, specifications: { ...formData.specifications, grossWeight: e.target.value } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 8.400Kg"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">kW/HP</label>
                            <input
                                type="text"
                                value={formData.specifications.kwHp}
                                onChange={(e) => setFormData({ ...formData, specifications: { ...formData.specifications, kwHp: e.target.value } })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 0.75/1.0"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Voltage</label>
                            <input
                                type="text"
                                value={formData.specifications.voltage}
                                onChange={(e) => setFormData({ ...formData, specifications: { ...formData.specifications, voltage: e.target.value } })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">MRP Price (₹)</label>
                        <input
                            type="number"
                            value={formData.specifications.mrpPrice}
                            onChange={(e) => setFormData({ ...formData, specifications: { ...formData.specifications, mrpPrice: e.target.value } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
