import { useState, useEffect } from 'react';
import axios from 'axios';

const AssignTechnicianModal = ({ isOpen, onClose, request, onAssign }) => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchTechnicians = async () => {
                try {
                    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/technicians`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    if (Array.isArray(data)) {
                        setTechnicians(data);
                    } else {
                        console.error('Failed to fetch technicians: data is not an array', data);
                        setTechnicians([]);
                    }
                } catch (error) {
                    console.error('Failed to fetch technicians', error);
                    setTechnicians([]);
                }
            };
            fetchTechnicians();
        }
    }, [isOpen]);

    const handleAssign = () => {
        if (selectedTechnician) {
            onAssign(request._id, selectedTechnician);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Assign Technician</h2>
                {request && (
                    <div className="mb-4">
                        <p><strong>Product:</strong> {request.product.model.name}</p>
                        <p><strong>Customer:</strong> {request.customer.name}</p>
                        <p><strong>Reason:</strong> {request.reason}</p>
                    </div>
                )}
                <div className="mb-4">
                    <label htmlFor="technician" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Technician
                    </label>
                    <select
                        id="technician"
                        value={selectedTechnician}
                        onChange={(e) => setSelectedTechnician(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">-- Select a Technician --</option>
                        {technicians.map((tech) => (
                            <option key={tech._id} value={tech.user?._id}>
                                {tech.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={!selectedTechnician}
                    >
                        Assign
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignTechnicianModal;
