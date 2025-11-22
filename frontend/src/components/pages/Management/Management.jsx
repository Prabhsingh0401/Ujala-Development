import React, { useState, useRef } from 'react';
import { Package, Tag, FileText } from 'lucide-react';
import Categories from './Categories';
import Models from './Models';
import BillingContent from './Biilling/BillingContent';
import ExportToExcelButton from '../../global/ExportToExcelButton';
import ExportToPdfButton from '../../global/ExportToPdfButton';

const Management = () => {
    const [activeTab, setActiveTab] = useState('categories');
    const childRef = useRef();

    const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${
                isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
        >
            <Icon className="w-4 h-4 mr-2" />
            {label}
        </button>
    );

    // Columns now use accessors that match the flattened getExportData structure
    const categoriesColumns = [
        { header: 'Name', accessor: 'Name' },
        { header: 'Status', accessor: 'Status' },
        { header: 'Model Count', accessor: 'Model Count' },
    ];

    const modelsColumns = [
        { header: 'Name', accessor: 'Name' },
        { header: 'Category', accessor: 'Category' },
        { header: 'Status', accessor: 'Status' },
        { header: 'Warranty', accessor: 'Warranty' },
    ];
    
    const getComponentData = () => {
        if (childRef.current) {
            return childRef.current.getComponentData();
        }
        return [];
    };

    // Unified function to prepare flattened data for both Excel and PDF
    const getExportData = () => {
        const data = getComponentData();
        if (activeTab === 'categories') {
            return data.map(c => ({
                Name: c.name,
                Status: c.status,
                'Model Count': c.modelCount || 0,
            }));
        }
        if (activeTab === 'models') {
            return data.map(m => ({
                Name: m.name,
                Category: m.category?.name || 'N/A',
                Status: m.status,
                Warranty: (m.warranty && m.warranty.length > 0 ? `${m.warranty[0].duration} ${m.warranty[0].durationType}` : 'No Warranty'),
            }));
        }
        return [];
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-1 bg-gray-300 p-1 rounded-lg w-fit">
                    <TabButton
                        id="categories"
                        label="Categories"
                        icon={Tag}
                        isActive={activeTab === 'categories'}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="models"
                        label="Models"
                        icon={Package}
                        isActive={activeTab === 'models'}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="billing"
                        label="Billing"
                        icon={FileText}
                        isActive={activeTab === 'billing'}
                        onClick={setActiveTab}
                    />
                </div>
                { (activeTab === 'categories' || activeTab === 'models') &&
                    <div className="flex space-x-2">
                        <ExportToExcelButton 
                            getData={getExportData} 
                            filename={`${activeTab}-export`}
                        />
                        <ExportToPdfButton 
                            getData={getExportData} 
                            columns={activeTab === 'categories' ? categoriesColumns : modelsColumns}
                            filename={`${activeTab}-export`}
                        />
                    </div>
                }
            </div>

            <div className="transition-all duration-300">
                {activeTab === 'categories' && <Categories ref={childRef} />}
                {activeTab === 'models' && <Models ref={childRef} />}
                {activeTab === 'billing' && <BillingContent />}
            </div>
        </div>
    );
};

export default Management;
