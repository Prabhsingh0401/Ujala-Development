import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const EditCustomerCredentialsModal = ({ isOpen, onClose, customer, onUpdate }) => {
    const [phone, setPhone] = useState(customer?.phone || '');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone) {
            toast.error('Phone number cannot be empty.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = { phone };
            if (password) {
                payload.password = password;
            }

            await axios.put(`${import.meta.env.VITE_API_URL}/api/customers/${customer._id}/credentials`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Customer credentials updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update credentials');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Edit Credentials for {customer.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md mt-1"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password (leave blank to keep unchanged)
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md mt-1"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCustomerCredentialsModal;
