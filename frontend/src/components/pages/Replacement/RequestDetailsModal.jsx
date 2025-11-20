import { X, Paperclip } from 'lucide-react';

const DetailItem = ({ label, value, isCurrency = false }) => (
    <div className="flex flex-col">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1 text-md text-gray-800">
            {isCurrency && value ? `₹${value}` : (value || <span className="text-gray-400">N/A</span>)}
        </p>
    </div>
);

const ImageItem = ({ label, path, api_url }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        {path ? (
            <img src={`${api_url}/${path.replace(/\\/g, '/')}`} alt={label} className="rounded-lg h-48 w-full object-cover border border-gray-200 shadow-sm" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl transform transition-all sm:my-8 sm:max-w-4xl w-full">
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Request Details
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="px-8 py-6 max-h-[60vh] overflow-y-auto overflow-x-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Left Column */}
                        <div className="space-y-8">
                            {/* Product Details */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Product Information</h4>
                                <div className="space-y-4">
                                    <DetailItem label="Product Name" value={request.product?.model?.name} />
                                    <DetailItem label="Serial Number" value={request.product?.serialNumber} />
                                </div>
                            </section>

                            {/* Customer Details */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Customer Information</h4>
                                <div className="space-y-4">
                                    <DetailItem label="Customer Name" value={request.customer?.name} />
                                    <DetailItem label="Customer Phone" value={request.customer?.phone} />
                                </div>
                            </section>

                            {/* Complaint Details */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Complaint Details</h4>
                                <div className="space-y-4">
                                    <DetailItem label="Complaint Description" value={request.complaintDescription || request.reason} />
                                    <DetailItem label="Preferred Visit Date" value={request.preferredVisitDate ? new Date(request.preferredVisitDate).toLocaleDateString() : 'N/A'} />
                                </div>
                            </section>

                             {/* Status & Assignment */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Status & Assignment</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <DetailItem label="Status" value={request.status} />
                                    <DetailItem label="Warranty" value={request.warrantyInfo?.inWarranty ? 'Active' : 'Expired'} />
                                    <DetailItem label="Assigned Technician" value={request.technician?.name} />
                                    <DetailItem label="Job Card #" value={request.jcNumber} />
                                </div>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                             {/* Attached Media */}
                             {request.mediaUrl && (
                                <section>
                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Attached Complaint Media</h4>
                                    <div className="mt-2">
                                        {request.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                            <img src={finalMediaUrl} alt="Complaint Media" className="rounded-xl shadow-md w-full object-contain" />
                                        ) : (
                                            <a href={finalMediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                                                <Paperclip className="h-5 w-5 mr-2" />
                                                View Attached File
                                            </a>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Diagnosis & Resolution */}
                            {request.serviceOutcome && (
                                <section>
                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Diagnosis & Resolution</h4>
                                    <div className="space-y-4">
                                        <DetailItem label="Service Outcome" value={request.serviceOutcome} />
                                        <DetailItem label="Diagnosis Notes" value={request.diagnosisNotes} />
                                    </div>

                                    {request.serviceOutcome === 'Repaired' && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Replaced Parts</h5>
                                            {request.repairedParts && request.repairedParts.length > 0 ? (
                                                <div className="flow-root">
                                                    <ul className="-my-2 divide-y divide-gray-100">
                                                        {request.repairedParts.map((part, index) => (
                                                            <li key={index} className="py-3 flex justify-between">
                                                                <span className="text-sm text-gray-700">{part.name}</span>
                                                                <span className="text-sm font-mono text-gray-900">₹{part.cost}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="py-3 flex justify-between font-bold border-t-2 border-gray-200 mt-2">
                                                        <span>Total Cost</span>
                                                        <span>₹{request.repairedParts.reduce((acc, part) => acc + (part.cost || 0), 0)}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No parts were listed for this repair.</p>
                                            )}
                                            <div className="grid grid-cols-2 gap-6 mt-6">
                                                <ImageItem label="Before Image" path={request.beforeImagePath} api_url={API_URL} />
                                                <ImageItem label="After Image" path={request.afterImagePath} api_url={API_URL} />
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-8 py-4 sm:flex sm:flex-row-reverse rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
