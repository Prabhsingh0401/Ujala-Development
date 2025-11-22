import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2, Paperclip } from 'lucide-react';

const DetailItem = ({ label, value, isCurrency = false }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-sm text-gray-900">
            {isCurrency && value != null ? `₹${value}` : (value != null ? value : 'N/A')}
        </p>
    </div>
);

export default function DiagnoseModal({ isOpen, onClose, onSubmit, request, billingConfig }) {
    const [diagnosisNotes, setDiagnosisNotes] = useState('');
    const [serviceOutcome, setServiceOutcome] = useState('');
    const [parts, setParts] = useState([{ name: '', cost: '' }]);
    const [beforeImage, setBeforeImage] = useState(null);
    const [afterImage, setAfterImage] = useState(null);

    if (!isOpen) return null;

    const API_URL = import.meta.env.VITE_API_URL;
    
    const warrantyDetails = request.warrantyInfo && billingConfig ? (
        request.warrantyInfo.inWarranty ? {
            title: 'In-Warranty Service',
            serviceCharge: billingConfig.serviceCharge,
            replacementCharge: billingConfig.replacementCharge,
            tncUrl: billingConfig.termsAndConditionsUrl,
        } : {
            title: 'Out-of-Warranty Service',
            serviceCharge: billingConfig.outOfWarrantyServiceCharge,
            replacementCharge: billingConfig.outOfWarrantyReplacementCharge,
            tncUrl: billingConfig.outOfWarrantyTermsAndConditionsUrl,
        }
    ) : null;
    
    const partsCost = parts.reduce((acc, part) => acc + (Number(part.cost) || 0), 0);
    let totalBill = null;
    if (warrantyDetails && !request.warrantyInfo.inWarranty && serviceOutcome === 'Repaired') {
        totalBill = (warrantyDetails.serviceCharge || 0) + (warrantyDetails.replacementCharge || 0) + partsCost;
    }

    const handlePartChange = (index, field, value) => {
        const newParts = [...parts];
        newParts[index][field] = value;
        setParts(newParts);
    };

    const addPart = () => {
        setParts([...parts, { name: '', cost: '' }]);
    };

    const removePart = (index) => {
        const newParts = parts.filter((_, i) => i !== index);
        setParts(newParts);
    };

    const handleSubmit = () => {
        if (!diagnosisNotes.trim() || !serviceOutcome) {
            toast.error('Please fill out diagnosis notes and select a service outcome.');
            return;
        }

        const formData = new FormData();
        formData.append('diagnosisNotes', diagnosisNotes);
        formData.append('serviceOutcome', serviceOutcome);

        if (serviceOutcome === 'Repaired') {
            const arePartsValid = parts.every(p => p.name.trim() && p.cost);
            if (!arePartsValid || !beforeImage || !afterImage) {
                toast.error('For repairs, please fill all part details and upload both before & after images.');
                return;
            }
            formData.append('repairedParts', JSON.stringify(parts));
            formData.append('beforeImage', beforeImage);
            formData.append('afterImage', afterImage);
        }
        
        onSubmit(request._id, formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Service Diagnosis & Report</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="overflow-y-auto space-y-4 pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Diagnosis Notes */}
                        <div>
                            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">Diagnosis Notes</label>
                            <textarea
                                id="diagnosis"
                                value={diagnosisNotes}
                                onChange={(e) => setDiagnosisNotes(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                rows="4"
                                placeholder="Describe your findings..."
                            ></textarea>
                        </div>

                        {/* Service Outcome */}
                        <div>
                            <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">Service Outcome</label>
                            <select
                                id="outcome"
                                value={serviceOutcome}
                                onChange={(e) => setServiceOutcome(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Outcome</option>
                                <option value="Repaired">Repaired</option>
                                <option value="Replacement Required">Replacement Required</option>
                            </select>
                        </div>

                        {/* Billing Information */}
                        {warrantyDetails && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-700">Billing Information</h4>
                                <DetailItem label="Service Charge" value={warrantyDetails.serviceCharge} isCurrency />
                                <DetailItem label="Replacement Charge" value={warrantyDetails.replacementCharge} isCurrency />
                                {serviceOutcome === 'Repaired' && (
                                    <DetailItem label="Parts Cost" value={partsCost} isCurrency />
                                )}
                                {totalBill !== null && (
                                    <div className="pt-2 border-t border-gray-200">
                                        <DetailItem label="Total Bill" value={totalBill} isCurrency />
                                    </div>
                                )}
                                {warrantyDetails.tncUrl && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Terms & Conditions</p>
                                        <a href={`${API_URL}/${warrantyDetails.tncUrl.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-900 mt-1">
                                            <Paperclip className="h-4 w-4 mr-1" />
                                            View T&C
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Right Column */}
                    {serviceOutcome === 'Repaired' && (
                        <div className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50">
                            <h4 className="font-semibold text-gray-800">Repair Details</h4>
                            
                            {parts.map((part, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Part Name"
                                        value={part.name}
                                        onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                                        className="w-1/2 p-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Part Cost (₹)"
                                        value={part.cost}
                                        onChange={(e) => handlePartChange(index, 'cost', e.target.value)}
                                        className="w-1/3 p-2 border border-gray-300 rounded-lg"
                                    />
                                    <button onClick={() => removePart(index)} className="text-red-500 hover:text-red-700 p-2">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}

                            <button onClick={addPart} className="flex items-center text-sm text-indigo-600 bg-indigo-50 p-2 rounded-lg hover:text-indigo-800 font-medium">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Part
                            </button>

                            <div className="pt-4 border-t border-gray-200">
                                <label htmlFor="beforeImage" className="block text-sm font-medium text-gray-700 mb-1">Before Image</label>
                                <input
                                    id="beforeImage"
                                    type="file"
                                    onChange={(e) => setBeforeImage(e.target.files[0])}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                            <div>
                                <label htmlFor="afterImage" className="block text-sm font-medium text-gray-700 mb-1">After Image</label>
                                <input
                                    id="afterImage"
                                    type="file"
                                    onChange={(e) => setAfterImage(e.target.files[0])}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-2 border-t border-gray-200 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Diagnosis</button>
                </div>
            </div>
        </div>
    );
}
