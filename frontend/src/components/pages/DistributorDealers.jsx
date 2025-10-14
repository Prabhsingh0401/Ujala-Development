import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributor/dealers`;

export default function DistributorDealers() {
    const { user } = useContext(AuthContext);
    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDistributorDealers = async () => {
            if (!user || !user.distributor) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/${user.distributor._id}`);
                setDealers(response.data);
            } catch (error) {
                toast.error('Error fetching distributor dealers');
                console.error('Error fetching distributor dealers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDistributorDealers();
    }, [user]);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading dealers...</p>
            </div>
        );
    }

    return (
        <div className="p-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dealers</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {dealers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dealers.map((dealer) => (
                                    <tr key={dealer._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dealer.dealerId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dealer.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dealer.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dealer.contactPerson}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dealer.contactPhone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
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
                        No dealers associated with this distributor.
                    </div>
                )}
            </div>
        </div>
    );
}
