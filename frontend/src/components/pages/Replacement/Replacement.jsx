import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { RefreshCw, Check, X } from 'lucide-react';
import AssignTechnicianModal from './AssignTechnicianModal';

export default function Replacement() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Pagination State
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Derived pagination values
    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const paginatedRequests = requests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/replacement-requests`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRequests(res.data);
        } catch (err) {
            toast.error('Error fetching replacement requests');
            console.error('Error fetching replacement requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleStatusUpdate = async (id, status) => {
        if (status === 'Approved') {
            const request = requests.find(req => req._id === id);
            setSelectedRequest(request);
            setIsModalOpen(true);
        } else {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${import.meta.env.VITE_API_URL}/api/replacement-requests/${id}`, { status }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                toast.success(`Request ${status.toLowerCase()}`);
                fetchRequests();
            } catch (error) {
                toast.error('Failed to update request status');
            }
        }
    };

    const handleAssignTechnician = async (id, technicianId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/replacement-requests/${id}`, { assignedTechnician: technicianId }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Technician assigned successfully');
            fetchRequests();
            setIsModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            toast.error('Failed to assign technician');
        }
    };

    return (
    <div className='p-4'>
        <div className="p-4 bg-white mt-2 rounded-lg">
            <h1 className="text-xl font-semibold text-gray-800">Replacement Requests</h1>
            <p className='mb-4'>Total {requests.length}</p>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-500">Loading requests...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20">
                    <RefreshCw className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No replacement requests</h3>
                    <p className="mt-1 text-sm text-gray-500">New replacement requests will appear here.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 rounded">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                                    
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Technician</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                                </tr>
                                                            </thead>
                                    
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {paginatedRequests.map((request) => (
                                                                    <tr key={request._id}>
                                                                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{request.product?.model?.name || 'N/A'}</td>
                                                                        <td className="px-4 py-4 text-sm text-gray-500">{request.product?.serialNumber || 'N/A'}</td>
                                                                        <td className="px-4 py-4 text-sm text-gray-500">{request.customer?.name || 'N/A'}</td>
                                                                        <td className="px-4 py-4 text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</td>
                                                                        <td className="px-4 py-4 text-sm text-gray-500">{request.reason}</td>
                                    
                                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                                request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                                request.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                                                                                'bg-red-100 text-red-800'
                                                                            }`}>
                                                                                {request.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-4 text-sm text-gray-500">{request.technician?.name || 'N/A'}</td>
                                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                                            <div className="flex items-center space-x-2">
                                                                                <button 
                                                                                    onClick={() => handleStatusUpdate(request._id, 'Approved')} 
                                                                                    className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                                                    disabled={request.status !== 'Pending'}
                                                                                >
                                                                                    <Check className="h-5 w-5" />
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => handleStatusUpdate(request._id, 'Rejected')} 
                                                                                    className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                                                    disabled={request.status !== 'Pending'}
                                                                                >
                                                                                    <X className="h-5 w-5" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                    
                                                    {/* ✅ Pagination UI */}
                                                    <div className="px-6 py-3 bg-white border-t border-gray-200 flex flex-col md:flex-row items-center md:justify-between gap-3 md:gap-0 rounded">
                                                        <div className="flex items-center space-x-2">
                                                            <span>Rows per page:</span>
                                                            <select
                                                                className="border border-gray-300 rounded px-2 py-1"
                                                                value={itemsPerPage}
                                                                onChange={(e) => {
                                                                    setItemsPerPage(Number(e.target.value));
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
                                    
                                                        <div className="text-sm text-gray-700 hidden md:block">
                                                            Showing {paginatedRequests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, requests.length)} of {requests.length} requests
                                                        </div>
                                    
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                                disabled={currentPage === 1}
                                                                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                                                            >
                                                                Previous
                                                            </button>
                                    
                                                            <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                                    
                                                            <button
                                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                                disabled={currentPage === totalPages}
                                                                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                    
                                            <AssignTechnicianModal
                                                isOpen={isModalOpen}
                                                onClose={() => {
                                                    setIsModalOpen(false);
                                                    setSelectedRequest(null);
                                                }}
                                                request={selectedRequest}
                                                onAssign={handleAssignTechnician}
                                            />
                                        </div>
                                    </div>
                                );
                            }
