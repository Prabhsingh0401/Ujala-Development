import { useState } from 'react';
import { Package, Tag, FileText } from 'lucide-react';
import Categories from './Categories';
import Models from './Models';
import BillingContent from './Biilling/BillingContent';

const Management = () => {
    const [activeTab, setActiveTab] = useState('categories');

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

    return (
        <div className="p-6">
            <div className="flex space-x-1 mb-6 bg-gray-300 p-1 rounded-lg w-fit">
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

            <div className="transition-all duration-300">
                {activeTab === 'categories' && <Categories />}
                {activeTab === 'models' && <Models />}
                {activeTab === 'billing' && <BillingContent />}
            </div>
        </div>
    );
};

export default Management;
