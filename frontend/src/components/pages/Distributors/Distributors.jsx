import { useState, useEffect } from 'react';
import { Search, Plus, X, FilePenLine, Trash2, Box } from 'lucide-react';
import ListComponent from '../../global/ListComponent';
import ErrorBoundary from '../../global/ErrorBoundary';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DistributorProductGroupList from './components/DistributorProductGroupList';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributors`;

function Distributors() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDistributorModal, setShowDistributorModal] = useState(false);
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDistributor, setSelectedDistributor] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showProductsModal, setShowProductsModal] = useState(false);
    const [distributorProducts, setDistributorProducts] = useState([]);
    const [showDealersModal, setShowDealersModal] = useState(false);
    const [distributorDealers, setDistributorDealers] = useState([]);
    
    const [newDistributor, setNewDistributor] = useState({
        name: '',
        location: '',
        territory: '',
        contactPerson: '',
        contactPhone: '',
        email: '',
        username: '',
        password: '',
        status: 'Active'
    });

    // Fetch distributors
    const fetchDistributors = async () => {
        try {
            setLoading(true);
            const response = await axios.get(searchTerm ? `${API_URL}?search=${searchTerm}` : API_URL);
            setDistributors(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching distributors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounceSearch = setTimeout(() => {
            fetchDistributors();
        }, 300);

        return () => clearTimeout(debounceSearch);
    }, [searchTerm]);

    const handleAddDistributor = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(API_URL, newDistributor);
            setDistributors([...distributors, response.data]);
            handleModalClose();
            toast.success('Distributor added successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding distributor');
        }
    };

    const handleEditDistributor = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${API_URL}/${selectedDistributor._id}`, newDistributor);
            setDistributors(distributors.map(d => d._id === selectedDistributor._id ? response.data : d));
            handleModalClose();
            toast.success('Distributor updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating distributor');
        }
    };

    const handleDeleteDistributor = async (distributorId) => {
        if (window.confirm('Are you sure you want to delete this distributor?')) {
            try {
                await axios.delete(`${API_URL}/${distributorId}`);
                setDistributors(distributors.filter(d => d._id !== distributorId));
                toast.success('Distributor deleted successfully');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting distributor');
            }
        }
    };

    const handleEditClick = (distributor) => {
        setSelectedDistributor(distributor);
        setNewDistributor({ ...distributor });
        setIsEditing(true);
        setShowDistributorModal(true);
    };

    const handleModalClose = () => {
        setShowDistributorModal(false);
        setSelectedDistributor(null);
        setIsEditing(false);
        setNewDistributor({
            name: '',
            location: '',
            territory: '',
            contactPerson: '',
            contactPhone: '',
            email: '',
            username: '',
            password: '',
            status: 'Active'
        });
    };

    const handleViewProducts = async (distributor) => {
        try {
            const { data } = await axios.get(`${API_URL}/${distributor._id}/products`);
            setDistributorProducts(data);
            setSelectedDistributor(distributor);
            setShowProductsModal(true);
        } catch (error) {
            toast.error('Error fetching distributor products');
            console.error('Error:', error);
        }
    };

    const handleStatusChange = async (distributorId, newStatus) => {
        try {
            const response = await axios.patch(`${API_URL}/${distributorId}/status`, { status: newStatus });
            setDistributors(distributors.map(d => d._id === distributorId ? response.data : d));
            toast.success('Distributor status updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating status');
        }
    };

    const handleViewDealers = async (distributor) => {
        try {
            const { data } = await axios.get(`${API_URL}/${distributor._id}/dealers`);
            setDistributorDealers(data);
            setSelectedDistributor(distributor);
            setShowDealersModal(true);
        } catch (error) {
            toast.error('Error fetching distributor dealers');
            console.error('Error:', error);
        }
    };


    return (
        <div className="p-2">
            <div className="p-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Distributor List</h2>
                                <p className="text-sm text-gray-600">
                                    Total {distributors.length}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowDistributorModal(true)}
                                    className="flex items-center justify-center space-x-2 bg-[#4d55f5] text-white px-4 py-2 rounded-lg hover:bg-[#3d45e5] transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Distributor</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                                <p className="mt-4 text-gray-500">Loading distributors...</p>
                            </div>
                        ) : (
                            <>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Territory</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products Count</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealers</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <ListComponent
                                            items={distributors}
                                            renderItem={(distributor) => (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{distributor.distributorId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{distributor.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{distributor.location}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{distributor.territory}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div>
                                                            <p>{distributor.contactPerson}</p>
                                                            <p className="text-gray-500">{distributor.contactPhone}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${distributor.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                            <select
                                                                value={distributor.status}
                                                                onChange={(e) => handleStatusChange(distributor._id, e.target.value)}
                                                                className="px-2 py-1 text-xs font-medium border border-gray-200 rounded-md cursor-pointer focus:ring-2 focus:ring-[#4d55f5] focus:border-[#4d55f5] bg-white"
                                                            >
                                                                <option value="Active">Active</option>
                                                                <option value="Inactive">Inactive</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleViewProducts(distributor)}
                                                            className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                                                        >
                                                            <Box className="h-4 w-4 mr-1" />
                                                            {distributor.productCount || 0} Products
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleViewDealers(distributor)}
                                                            className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                                                        >
                                                            <Box className="h-4 w-4 mr-1" />
                                                            {distributor.dealers?.length || 0} Dealers
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center space-x-2">
                                                            <button 
                                                                onClick={() => handleEditClick(distributor)}
                                                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                            >
                                                                <FilePenLine size={20} className="text-gray-500" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteDistributor(distributor._id)}
                                                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                            >
                                                                <Trash2 size={20} className="text-red-500" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                            itemContainer="tr"
                                            listContainer="tbody"
                                            itemClassName="hover:bg-gray-50"
                                            listClassName="bg-white divide-y divide-gray-200"
                                        />
                                    </table>
                                </div>

                                <div className="md:hidden space-y-4">
                                    {distributors.length > 0 ? (
                                        <ListComponent
                                            items={distributors}
                                            renderItem={(distributor) => (
                                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-medium text-gray-900">{distributor.name}</h3>
                                                        <div className="flex items-center space-x-2">
                                                            <button 
                                                                onClick={() => handleEditClick(distributor)}
                                                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                            >
                                                                <FilePenLine size={20} className="text-gray-500" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteDistributor(distributor._id)}
                                                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                            >
                                                                <Trash2 size={20} className="text-red-500" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{distributor.distributorId}</p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                                        <div><span className="font-medium">Location:</span> {distributor.location}</div>
                                                        <div><span className="font-medium">Territory:</span> {distributor.territory}</div>
                                                        <div><span className="font-medium">Contact:</span> {distributor.contactPerson}</div>
                                                        <div><span className="font-medium">Phone:</span> {distributor.contactPhone}</div>
                                                        <div className="col-span-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${distributor.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                <select
                                                                    value={distributor.status}
                                                                    onChange={(e) => handleStatusChange(distributor._id, e.target.value)}
                                                                    className="px-2 py-1 text-xs font-medium border border-gray-200 rounded-md cursor-pointer focus:ring-2 focus:ring-[#4d55f5] focus:border-[#4d55f5] bg-white"
                                                                >
                                                                    <option value="Active">Active</option>
                                                                    <option value="Inactive">Inactive</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 mt-2">
                                                            <button
                                                                onClick={() => handleViewProducts(distributor)}
                                                                className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                                                            >
                                                                <Box className="h-4 w-4 mr-1" />
                                                                {distributor.productCount || 0} Products
                                                            </button>
                                                        </div>
                                                        <div className="col-span-2 mt-2">
                                                            <button
                                                                onClick={() => handleViewDealers(distributor)}
                                                                className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                                                            >
                                                                <Box className="h-4 w-4 mr-1" />
                                                                {distributor.dealers?.length || 0} Dealers
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            itemContainer="div"
                                            listContainer="div"
                                            listClassName="space-y-4"
                                        />
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">No distributors found</div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showDistributorModal && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {isEditing ? 'Edit Distributor' : 'Add New Distributor'}
                            </h3>
                            <button
                                onClick={handleModalClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={isEditing ? handleEditDistributor : handleAddDistributor}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDistributor.name}
                                        onChange={(e) => setNewDistributor({...newDistributor, name: e.target.value})}
                                        placeholder="Enter distributor name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDistributor.location}
                                        onChange={(e) => setNewDistributor({...newDistributor, location: e.target.value})}
                                        placeholder="Enter location"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Territory *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDistributor.territory}
                                        onChange={(e) => setNewDistributor({...newDistributor, territory: e.target.value})}
                                        placeholder="Enter territory"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDistributor.contactPerson}
                                        onChange={(e) => setNewDistributor({...newDistributor, contactPerson: e.target.value})}
                                        placeholder="Enter contact person name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newDistributor.contactPhone}
                                        onChange={(e) => setNewDistributor({...newDistributor, contactPhone: e.target.value})}
                                        placeholder="Enter contact phone"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={newDistributor.email}
                                        onChange={(e) => setNewDistributor({...newDistributor, email: e.target.value})}
                                        placeholder="Enter email address"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDistributor.username}
                                        onChange={(e) => setNewDistributor({...newDistributor, username: e.target.value})}
                                        placeholder="Enter username"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={newDistributor.password}
                                        onChange={(e) => setNewDistributor({...newDistributor, password: e.target.value})}
                                        placeholder="Enter password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                                    <select
                                        required
                                        value={newDistributor.status}
                                        onChange={(e) => setNewDistributor({...newDistributor, status: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors font-medium"
                                >
                                    {isEditing ? 'Update Distributor' : 'Add Distributor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showProductsModal && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Products for {selectedDistributor?.name}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowProductsModal(false);
                                    setSelectedDistributor(null);
                                    setDistributorProducts([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="mt-4">
                            <DistributorProductGroupList products={distributorProducts} />
                        </div>
                    </div>
                </div>
            )}

            {showDealersModal && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Dealers for {selectedDistributor?.name}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowDealersModal(false);
                                    setSelectedDistributor(null);
                                    setDistributorDealers([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="mt-4">
                            {distributorDealers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {distributorDealers.map((dealer) => (
                                                <tr key={dealer._id}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{dealer.dealerId}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{dealer.name}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{dealer.location}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            dealer.status === 'Active' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {dealer.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No dealers found for this distributor
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DistributorsWithErrorBoundary() {
    return (
        <ErrorBoundary>
            <Distributors />
        </ErrorBoundary>
    );
}
