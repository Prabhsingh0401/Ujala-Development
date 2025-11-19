import { X, Paperclip } from 'lucide-react';

const DetailItem = ({ label, value, isCurrency = false }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-sm text-gray-900">
            {isCurrency && value ? `₹${value}` : (value || 'N/A')}
        </p>
    </div>
);

const ImageItem = ({ label, path, api_url }) => (
    <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        {path ? (
            <img src={`${api_url}/${path.replace(/\\/g, '/')}`} alt={label} className="rounded-lg max-h-40 w-full object-contain border" />
        ) : (
            <p className="mt-1 text-sm text-gray-400">Not available</p>
        )}
    </div>
);

export default function RequestDetailsModal({ isOpen, onClose, request }) {
    if (!isOpen || !request) return null;

    const API_URL = import.meta.env.VITE_API_URL;

    // Handle both old and new mediaUrl formats
    let mediaPath = request.mediaUrl || '';
    if (mediaPath.startsWith('public')) {
        mediaPath = mediaPath.substring(7);
    }
    const finalMediaUrl = `${API_URL}/${mediaPath.replace(/\\/g, '/')}`;

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-75 transition-opacity z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Request Details
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Product Details */}
                            <div>
                                <h4 className="font-medium text-gray-800 border-b border-gray-200 pb-1 mb-2">Product Information</h4>
                                <DetailItem label="Product Name" value={request.product?.model?.name} />
                                <DetailItem label="Serial Number" value={request.product?.serialNumber} />
                            </div>

                            {/* Customer Details */}
                            <div>
                                <h4 className="font-medium text-gray-800 border-b border-gray-200 pb-1 mb-2">Customer Information</h4>
                                <DetailItem label="Customer Name" value={request.customer?.name} />
                                <DetailItem label="Customer Phone" value={request.customer?.phone} />
                            </div>

                            {/* Complaint Details */}
                            <div>
                                <h4 className="font-medium text-gray-800 border-b border-gray-200 pb-1 mb-2">Complaint Details</h4>
                                <DetailItem label="Complaint Description" value={request.complaintDescription || request.reason} />
                                <DetailItem label="Preferred Visit Date" value={request.preferredVisitDate ? new Date(request.preferredVisitDate).toLocaleDateString() : 'N/A'} />
                            </div>

                             {/* Status & Assignment */}
                            <div>
                                <h4 className="font-medium text-gray-800 border-b border-gray-200 pb-1 mb-2">Status & Assignment</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Status" value={request.status} />
                                    <DetailItem label="Warranty" value={request.warrantyInfo?.inWarranty ? 'Active' : 'Expired'} />
                                    <DetailItem label="Assigned Technician" value={request.technician?.name} />
                                    <DetailItem label="Job Card #" value={request.jcNumber} />
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                             {/* Attached Media */}
                             {request.mediaUrl && (
                                <div>
                                    <h4 className="font-medium text-gray-800 border-b border-gray-200 pb-1 mb-2">Attached Complaint Media</h4>
                                    <div className="mt-2">
                                        {request.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                            <img src={finalMediaUrl} alt="Complaint Media" className="rounded-lg max-h-60 w-full object-contain" />
                                        ) : (
                                            <a href={finalMediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-900">
                                                <Paperclip className="h-5 w-5 mr-2" />
                                                View Attached File
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Diagnosis & Resolution */}
                            {request.serviceOutcome && (
                                <div>
                                    <h4 className="font-medium text-gray-800 border-b border-gray-200 pb-1 mb-2">Diagnosis & Resolution</h4>
                                    <DetailItem label="Service Outcome" value={request.serviceOutcome} />
                                    <DetailItem label="Diagnosis Notes" value={request.diagnosisNotes} />

                                    {request.serviceOutcome === 'Repaired' && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <h5 className="text-sm font-medium text-gray-600 mb-2">Replaced Parts</h5>
                                            {request.repairedParts && request.repairedParts.length > 0 ? (
                                                <div className="space-y-2">
                                                    <ul className="divide-y divide-gray-200">
                                                        {request.repairedParts.map((part, index) => (
                                                            <li key={index} className="py-2 flex justify-between">
                                                                <span className="text-sm text-gray-800">{part.name}</span>
                                                                <span className="text-sm font-medium text-gray-900">₹{part.cost}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="py-2 flex justify-between font-bold border-t border-gray-200">
                                                        <span>Total Cost</span>
                                                        <span>₹{request.repairedParts.reduce((acc, part) => acc + (part.cost || 0), 0)}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No parts were listed for this repair.</p>
                                            )}
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <ImageItem label="Before Image" path={request.beforeImagePath} api_url={API_URL} />
                                                <ImageItem label="After Image" path={request.afterImagePath} api_url={API_URL} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
