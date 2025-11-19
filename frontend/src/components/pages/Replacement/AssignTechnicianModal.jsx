import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { User, MapPin, Briefcase, Paperclip } from 'lucide-react';

const TechnicianTable = ({ title, technicians, selectedTechnician, onSelect }) => (
    <div>
        <h3 className="text-md font-semibold text-gray-700 mb-3">{title}</h3>
        {technicians.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {technicians.map((tech) => (
                            <tr 
                                key={tech._id} 
                                className="hover:bg-blue-50 cursor-pointer"
                                onClick={() => onSelect(tech.user?._id)}
                            >
                                <td className="px-4 py-3">
                                    <input
                                        type="radio"
                                        name="technician"
                                        readOnly
                                        checked={selectedTechnician === tech.user?._id}
                                        className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-gray-900">{tech.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center mt-1">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {tech.city}, {tech.state}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm text-gray-900 flex items-center">
                                        <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                                        {tech.assignedRequests.length}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center py-6 px-4 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500">No technicians in this category.</p>
            </div>
        )}
    </div>
);


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

    const { closestTechnicians, otherTechnicians } = useMemo(() => {
        if (!request || !request.customer) {
            return { closestTechnicians: [], otherTechnicians: technicians };
        }
        const { state, city } = request.customer;
        const closest = technicians.filter(tech => tech.state === state && tech.city === city);
        const other = technicians.filter(tech => tech.state !== state || tech.city !== city);
        return { closestTechnicians: closest, otherTechnicians: other };
    }, [technicians, request]);

    const handleAssign = () => {
        if (selectedTechnician) {
            onAssign(request._id, selectedTechnician);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-50 p-6 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Assign Technician</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-grow min-h-0">
                    {/* Left Column: Request Details */}
                    <div className="md:col-span-1 bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                        <h3 className="text-md font-semibold text-gray-700 border-b pb-3 mb-4">Request Details</h3>
                        {request && (
                            <div className="space-y-1 text-sm">
                                <div className="grid grid-cols-2 gap-x-2">
                                    <span className="font-medium text-gray-500">Customer:</span>
                                    <span className="text-gray-800 font-semibold text-right">{request.customer.name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2">
                                    <span className="font-medium text-gray-500">Phone:</span>
                                    <span className="text-gray-800 text-right">{request.customer.phone}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <span className="font-medium text-gray-500">Location:</span>
                                    <span className="text-gray-800 text-right">{request.customer.city}, {request.customer.state}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <span className="font-medium text-gray-500">Product:</span>
                                    <span className="text-gray-800 text-right">{request.product.model.name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <span className="font-medium text-gray-500">Serial:</span>
                                    <span className="text-gray-800 text-right">{request.product.serialNumber}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <span className="font-medium text-gray-500">Visit Date:</span>
                                    <span className="text-gray-800 text-right">{request.preferredVisitDate ? new Date(request.preferredVisitDate).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="pt-2">
                                    <span className="font-medium text-gray-500">Complaint Description:</span>
                                    <p className="text-gray-800 mt-1 bg-gray-50 p-2 rounded">{request.complaintDescription || request.reason}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Technician Tables */}
                    <div className="md:col-span-2 space-y-6 overflow-y-auto pr-2">
                        <TechnicianTable
                            title="Closest Technicians"
                            technicians={closestTechnicians}
                            selectedTechnician={selectedTechnician}
                            onSelect={setSelectedTechnician}
                        />
                        <TechnicianTable
                            title="Other Technicians"
                            technicians={otherTechnicians}
                            selectedTechnician={selectedTechnician}
                            onSelect={setSelectedTechnician}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 mt-auto">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        className="px-5 py-2 bg-[#5b189b] text-white rounded-lg font-semibold text-sm disabled:bg-blue-400"
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
