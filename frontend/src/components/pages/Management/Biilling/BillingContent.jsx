import React, { useState } from 'react';
import InWarrantyOutput from './components/InWarrantyOutput';
import EditInWarranty from './components/EditInWarranty';
import OutOfWarrantyOutput from './components/OutOfWarrantyOutput';
import EditOutOfWarranty from './components/EditOutOfWarranty';

const TabButton = ({ id, label, isActive, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-blue-100'
        }`}
    >
        {label}
    </button>
);

const InWarrantyContent = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [config, setConfig] = useState(null); // State to hold the current config from InWarrantyOutput
    const [refreshOutput, setRefreshOutput] = useState(false); // State to trigger re-fetch in InWarrantyOutput

    // Function to pass to InWarrantyOutput to get the latest config
    const handleConfigLoaded = (loadedConfig) => {
        setConfig(loadedConfig);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCloseEdit = () => {
        setIsEditing(false);
    };

    const handleSaveSuccess = (updatedConfig) => {
        setConfig(updatedConfig); // Update local config state
        setRefreshOutput(prev => !prev); // Trigger re-fetch in InWarrantyOutput
        handleCloseEdit();
    };

    return (
        <div>
            {!isEditing && <InWarrantyOutput onEdit={handleEdit} onConfigLoaded={handleConfigLoaded} refresh={refreshOutput} />}
            {isEditing && <EditInWarranty onClose={handleCloseEdit} currentConfig={config} onSaveSuccess={handleSaveSuccess} />}
        </div>
    );
};

const OutOfWarrantyContent = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [config, setConfig] = useState(null); // State to hold the current config from OutOfWarrantyOutput
    const [refreshOutput, setRefreshOutput] = useState(false); // State to trigger re-fetch in OutOfWarrantyOutput

    // Function to pass to OutOfWarrantyOutput to get the latest config
    const handleConfigLoaded = (loadedConfig) => {
        setConfig(loadedConfig);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCloseEdit = () => {
        setIsEditing(false);
    };

    const handleSaveSuccess = (updatedConfig) => {
        setConfig(updatedConfig); // Update local config state
        setRefreshOutput(prev => !prev); // Trigger re-fetch in OutOfWarrantyOutput
        handleCloseEdit();
    };

    return (
        <div>
            {!isEditing && <OutOfWarrantyOutput onEdit={handleEdit} onConfigLoaded={handleConfigLoaded} refresh={refreshOutput} />}
            {isEditing && <EditOutOfWarranty onClose={handleCloseEdit} currentConfig={config} onSaveSuccess={handleSaveSuccess} />}
        </div>
    );
};


export default function BillingContent() {
    const [activeTab, setActiveTab] = useState('in-warranty');

    const tabs = [
        { id: 'in-warranty', label: 'In Warranty', content: <InWarrantyContent /> },
        { id: 'out-of-warranty', label: 'Out of Warranty', content: <OutOfWarrantyContent /> }
    ];

    const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

    return (
        <div className="p-4">
            <div className="flex space-x-2 mb-4">
                {tabs.map(tab => (
                    <TabButton
                        key={tab.id}
                        id={tab.id}
                        label={tab.label}
                        isActive={activeTab === tab.id}
                        onClick={setActiveTab}
                    />
                ))}
            </div>
            <div>
                {activeContent}
            </div>
        </div>
    );
}
