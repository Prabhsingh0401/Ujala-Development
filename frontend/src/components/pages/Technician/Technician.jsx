import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';

export default function Technician() {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        state: '',
        city: '',
        username: '',
        password: '',
    });
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const fetchStates = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/locations/states`);
            setStates(response.data);
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const fetchCities = async (state) => {
        if (!state) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/locations/cities/${state}`);
            setCities(response.data);
        } catch (error) {
            console.error(`Error fetching cities for ${state}:`, error);
        }
    };

    useEffect(() => {
        fetchStates();
    }, []);

    useEffect(() => {
        if (formData.state) {
            fetchCities(formData.state);
        }
    }, [formData.state]);

    const fetchTechnicians = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/technicians`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTechnicians(res.data);
        } catch (err) {
            toast.error('Error fetching technicians');
            console.error('Error fetching technicians:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'state') {
            setFormData({ ...formData, state: value, city: '' });
        }
    };

    const handleAddTechnician = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/technicians`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Technician added successfully');
            setShowAddModal(false);
            fetchTechnicians();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add technician');
        }
    };

    const handleEditTechnician = (technician) => {
        setSelectedTechnician(technician);
        setFormData({
            name: technician.name,
            phone: technician.phone,
            address: technician.address,
            state: technician.state,
            city: technician.city,
            username: technician.user.username,
            password: '',
        });
        setShowEditModal(true);
    };

    const handleUpdateTechnician = async (e) => {
        e.preventDefault();
        if (!selectedTechnician) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/technicians/${selectedTechnician._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Technician updated successfully');
            setShowEditModal(false);
            fetchTechnicians();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update technician');
        }
    };

    const handleDeleteTechnician = async (id) => {
        if (window.confirm('Are you sure you want to delete this technician?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/technicians/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Technician deleted successfully');
                fetchTechnicians();
            } catch (error) {
                toast.error('Failed to delete technician');
            }
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-gray-800">Technicians</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Technician
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-500">Loading technicians...</p>
                </div>
            ) : technicians.length === 0 ? (
                <div className="text-center py-20">
                    <Users className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No technicians found</h3>
                    <p className="mt-1 text-sm text-gray-500">Add a technician to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Requests</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {technicians.map((technician) => (
                                <tr key={technician._id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{technician.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{technician.phone}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{technician.address}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{technician.state}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{technician.city}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{technician.user.username}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{technician.assignedRequests.length}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleEditTechnician(technician)} className="text-indigo-600 hover:text-indigo-900"><Edit className="h-5 w-5" /></button>
                                            <button onClick={() => handleDeleteTechnician(technician._id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Technician</h3>
                        <form onSubmit={handleAddTechnician}>
                            <div className="space-y-4 grid grid-cols-2 gap-4">
                                <input type="text" name="name" placeholder="Name" onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                <input type="text" name="phone" placeholder="Phone" onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                <input type="text" name="address" placeholder="Address" onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                <select name="state" onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required>
                                    <option value="">Select State</option>
                                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                                </select>
                                <select name="city" onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required>
                                    <option value="">Select City</option>
                                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                                <input type="text" name="username" placeholder="Username" onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                <input type="password" name="password" placeholder="Password" onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Technician</h3>
                        <form onSubmit={handleUpdateTechnician}>
                            <div className="space-y-4">
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                <select name="state" value={formData.state} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required>
                                    <option value="">Select State</option>
                                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                                </select>
                                <select name="city" value={formData.city} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required>
                                    <option value="">Select City</option>
                                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                <input type="password" name="password" placeholder="New Password" onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}