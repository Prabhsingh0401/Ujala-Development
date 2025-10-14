import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useFactories } from './hooks/useFactories';
import FactoryList from './components/FactoryList';
import FactoryModal from './components/FactoryModal';
import FactoryOrdersModal from './components/FactoryOrdersModal';

export default function FactoryManagement() {
    const { factories, loading, searchTerm, setSearchTerm, addFactory, updateFactory, deleteFactory, fetchFactories } = useFactories();
    const [showFactoryModal, setShowFactoryModal] = useState(false);
    const [showOrdersModal, setShowOrdersModal] = useState(false);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleAddClick = () => {
        setIsEditing(false);
        setSelectedFactory(null);
        setShowFactoryModal(true);
    };

    const handleEditClick = (factory) => {
        setIsEditing(true);
        setSelectedFactory(factory);
        setShowFactoryModal(true);
    };

    const handleModalClose = () => {
        setShowFactoryModal(false);
        setSelectedFactory(null);
        setIsEditing(false);
    };

    const handleSaveFactory = async (factoryData) => {
        let success;
        if (isEditing) {
            success = await updateFactory(selectedFactory._id, factoryData);
        } else {
            success = await addFactory(factoryData);
        }
        if (success) {
            handleModalClose();
        }
    };

    const handleViewOrders = (factory) => {
        setSelectedFactory(factory);
        setShowOrdersModal(true);
    };

    return (
        <div className="p-4">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Factory Management</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Factories</h2>
                                <p className="text-sm text-gray-600">
                                    Total {factories.length}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search factories..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={handleAddClick}
                                    className="flex items-center justify-center space-x-2 bg-[#4d55f5] text-white px-4 py-2 rounded-lg hover:bg-[#3d45e5] transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Factory</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <FactoryList
                        factories={factories}
                        loading={loading}
                        onEdit={handleEditClick}
                        onDelete={deleteFactory}
                        onViewOrders={handleViewOrders}
                    />
                </div>
            </div>

            <FactoryModal
                isOpen={showFactoryModal}
                onClose={handleModalClose}
                onSave={handleSaveFactory}
                factory={selectedFactory}
                isEditing={isEditing}
            />

            <FactoryOrdersModal
                isOpen={showOrdersModal}
                onClose={() => setShowOrdersModal(false)}
                factory={selectedFactory}
                fetchFactories={fetchFactories}
            />
        </div>
    );
}
