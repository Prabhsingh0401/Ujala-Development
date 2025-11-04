import { useState, useEffect, useMemo } from 'react';
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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedDistributors, setSelectedDistributors] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [newDistributor, setNewDistributor] = useState({
        name: '',
        state: '',
        city: '',
        address: '',
        gstNumber: '',
        contactPerson: '',
        contactPhone: '',
        email: '',
        username: '',
        password: '',
        status: 'Active'
    });

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/locations/states`);
                setStates(response.data);
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        };
        fetchStates();
    }, []);

    const fetchCities = async (state) => {
        if (!state) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/locations/cities/${state}`);
            setCities(response.data);
        } catch (error) {
            console.error(`Error fetching cities for ${state}:`, error);
        }
    };

    const totalPages = useMemo(() => Math.ceil(distributors.length / itemsPerPage), [distributors, itemsPerPage]);
    const paginatedDistributors = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return distributors.slice(startIndex, startIndex + itemsPerPage);
    }, [distributors, currentPage, itemsPerPage]);

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

        if (newDistributor.state) {
            fetchCities(newDistributor.state);
        }

        return () => clearTimeout(debounceSearch);
    }, [searchTerm, newDistributor.state]);

    const handleAddDistributor = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post(API_URL, newDistributor);
            setDistributors([...distributors, response.data]);
            handleModalClose();
            toast.success('Distributor added successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding distributor');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditDistributor = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.put(`${API_URL}/${selectedDistributor._id}`, newDistributor);
            setDistributors(distributors.map(d => d._id === selectedDistributor._id ? response.data : d));
            handleModalClose();
            toast.success('Distributor updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating distributor');
        } finally {
            setIsSubmitting(false);
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
        setNewDistributor({ ...distributor, state: distributor.state || '', city: distributor.city || '' });
        setIsEditing(true);
        setShowDistributorModal(true);
    };

    const handleModalClose = () => {
        setShowDistributorModal(false);
        setSelectedDistributor(null);
        setIsEditing(false);
        setNewDistributor({
            name: '',
            state: '',
            city: '',
            address: '',
            gstNumber: '',
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
            const [productsResponse, dealersResponse] = await Promise.all([
                axios.get(`${API_URL}/${distributor._id}/products`),
                axios.get(`${API_URL}/${distributor._id}/dealers`)
            ]);
            setDistributorProducts(productsResponse.data);
            setDistributorDealers(dealersResponse.data);
            setSelectedDistributor(distributor);
            setShowProductsModal(true);
        } catch (error) {
            toast.error('Error fetching distributor data');
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

    const handleSelect = (id) => {
        setSelectedDistributors(prev =>
            prev.includes(id) ? prev.filter(distributorId => distributorId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select only the distributors visible on the current page
            setSelectedDistributors(paginatedDistributors.map(d => d._id));
        } else {
            setSelectedDistributors([]);
        }
    };

    const handleDeleteSelected = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedDistributors.length} selected distributors?`)) {
            try {
                await axios.delete(API_URL, { data: { distributorIds: selectedDistributors } });
                fetchDistributors();
                setSelectedDistributors([]);
                toast.success('Selected distributors deleted successfully');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting distributors');
            }
        }
    };


    return (
        <div className="p-2">
            <div className="p-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 lg:p-6 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Distributor List</h2>
                                <p className="text-sm text-gray-600">
                                    Total {distributors.length}
                                </p>
                            </div>
                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full lg:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>
                                {selectedDistributors.length > 0 ? (
                                    <button
                                        onClick={handleDeleteSelected}
                                        className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete ({selectedDistributors.length})</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowDistributorModal(true)}
                                        className="flex items-center justify-center space-x-2 bg-[#4d55f5] text-white px-4 py-2 rounded-lg hover:bg-[#3d45e5] transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add Distributor</span>
                                    </button>
                                )}
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <input
                                                        type="checkbox"
                                                        onChange={handleSelectAll}
                                                        // checked when all items on current page are selected
                                                        checked={paginatedDistributors.length > 0 && selectedDistributors.length === paginatedDistributors.length}
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th> */}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th> */}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Number</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products Count</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealers</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <ListComponent
                                            items={paginatedDistributors}
                                            renderItem={(distributor) => (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        <input type="checkbox" checked={selectedDistributors.includes(distributor._id)} onChange={() => handleSelect(distributor._id)} />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{distributor.distributorId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{distributor.name}</td>
                                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{distributor.state}</td> */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{distributor.city}</td>
                                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{distributor.address}</td> */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{distributor.gstNumber}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div>
                                                            <p>{distributor.contactPerson}</p>
                                                            <p className="text-gray-500">{distributor.contactPhone}</p>
                                                        </div>
                                                    </td>
                                                    {/* <td className="px-6 py-4 whitespace-nowrap">
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
                                                    </td> */}
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
                                            items={paginatedDistributors}
                                            renderItem={(distributor) => (
                                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-medium text-gray-900">{distributor.name}</h3>
                                                        <div className="flex items-center space-x-2">
                                                            <input type="checkbox" checked={selectedDistributors.includes(distributor._id)} onChange={() => handleSelect(distributor._id)} />
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
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                                                        <div><span className="font-medium">State:</span> {distributor.state}</div>
                                                        <div><span className="font-medium">City:</span> {distributor.city}</div>
                                                        <div><span className="font-medium">Address:</span> {distributor.address}</div>
                                                        <div><span className="font-medium">GST Number:</span> {distributor.gstNumber}</div>
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
                    {distributors.length > 0 && (
                        <div className="px-6 py-3 border-t border-gray-200 flex flex-col md:flex-row items-center md:justify-between gap-3 md:gap-0">
                            <div className="w-full md:w-auto flex items-center justify-between md:justify-start text-sm text-gray-700 space-x-2">
                                <div className="flex items-center space-x-2">
                                    <span className="whitespace-nowrap">Rows per page:</span>
                                    <select
                                        className="ml-2 border border-gray-300 rounded px-2 py-1"
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            // Clear selection when changing rows per page and reset to first page
                                            setSelectedDistributors([]);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="75">75</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>

                                {/* On larger screens show the verbose range text; hide on small screens */}
                                <div className="hidden md:block text-sm text-gray-700">
                                    Showing {paginatedDistributors.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, distributors.length)} of {distributors.length} distributors
                                </div>
                            </div>

                            <div className="w-full md:w-auto flex items-center justify-between md:justify-end space-x-2">
                                {/* On very small screens keep compact page info */}
                                <div className="text-sm text-gray-700 md:hidden">Page {currentPage} of {totalPages}</div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            // clear selection when moving pages
                                            setSelectedDistributors([]);
                                            setCurrentPage(prev => Math.max(1, prev - 1));
                                        }}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <span className="text-sm text-gray-700 hidden md:inline">Page {currentPage} of {totalPages}</span>

                                    <button
                                        onClick={() => {
                                            // clear selection when moving pages
                                            setSelectedDistributors([]);
                                            setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                        }}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showDistributorModal && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-4 w-full max-w-md lg:max-w-5xl max-h-[95vh] overflow-y-auto">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                    <select
                                        required
                                        value={newDistributor.state}
                                        onChange={(e) => {
                                            setNewDistributor({...newDistributor, state: e.target.value, city: ''});
                                            fetchCities(e.target.value);
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                    <select
                                        required
                                        value={newDistributor.city}
                                        onChange={(e) => setNewDistributor({...newDistributor, city: e.target.value})}
                                        disabled={!newDistributor.state}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDistributor.address}
                                        onChange={(e) => setNewDistributor({...newDistributor, address: e.target.value})}
                                        placeholder="Enter address"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDistributor.gstNumber}
                                        onChange={(e) => setNewDistributor({...newDistributor, gstNumber: e.target.value})}
                                        placeholder="Enter GST Number"
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
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-3 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors font-medium flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        isEditing ? 'Update Distributor' : 'Add Distributor'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showProductsModal && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg lg:max-w-6xl max-h-[90vh] overflow-y-auto">
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
                            <DistributorProductGroupList products={distributorProducts} dealers={distributorDealers} distributor={selectedDistributor} />
                        </div>
                    </div>
                </div>
            )}

            {showDealersModal && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg lg:max-w-4xl max-h-[90vh] overflow-y-auto">
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
                                    <table className="min-w-full responsive-table">
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
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900" data-label="Dealer ID">{dealer.dealerId}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900" data-label="Name">{dealer.name}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900" data-label="Location">{dealer.location}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap" data-label="Status">
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
