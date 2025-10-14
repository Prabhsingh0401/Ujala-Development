import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributor-requests`;

export default function DistributorRegister({ onBack }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        territory: '',
    });
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(API_URL, formData);
            setShowSuccessModal(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration request failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200 mr-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-bold text-gray-900">Register as Distributor</h2>
            </div>
            <p className="text-gray-600 mb-8">Fill out the form below to request a distributor account.</p>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">Name *</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent transition-shadow duration-200"
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your company name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">Email *</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent transition-shadow duration-200"
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">Phone *</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent transition-shadow duration-200"
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="location">Location *</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent transition-shadow duration-200"
                            id="location"
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter your location"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="territory">Territory</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent transition-shadow duration-200"
                            id="territory"
                            type="text"
                            name="territory"
                            value={formData.territory}
                            onChange={handleChange}
                            placeholder="Enter your territory (optional)"
                        />
                    </div>
                </div>

                <button
                    className="w-full bg-[#4d55f5] hover:bg-[#3d45e5] text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline transition-colors duration-200 disabled:opacity-50 mt-8"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Submitting Request...' : 'Submit Registration Request'}
                </button>
            </form>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 text-center">
                        <div className="flex justify-end">
                            <button
                                onClick={() => { setShowSuccessModal(false); onBack(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Submitted!</h3>
                        <p className="text-gray-600 mb-6">Your distributor registration request has been submitted successfully and is now awaiting admin approval. You will be notified once your request has been processed.</p>
                        <button
                            onClick={() => { setShowSuccessModal(false); onBack(); }}
                            className="w-full bg-[#4d55f5] hover:bg-[#3d45e5] text-white py-2 px-4 rounded-xl"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}