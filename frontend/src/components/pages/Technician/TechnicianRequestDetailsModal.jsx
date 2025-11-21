import { X, Paperclip } from 'lucide-react';

const DetailItem = ({ label, value, isCurrency = false }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-sm text-gray-900">
            {isCurrency && value != null ? `₹${value}` : (value != null ? value : 'N/A')}
        </p>
    </div>
);

export default function TechnicianRequestDetailsModal({ isOpen, onClose, request, billingConfig }) {
    if (!isOpen || !request) return null;

    const API_URL = import.meta.env.VITE_API_URL;

    let finalMediaUrl = '';
    if (request.mediaUrl) {
        let mediaPath = request.mediaUrl.replace(/\\/g, '/');
        // For backward compatibility with old data that doesn't have 'public/' prefix
        if (mediaPath.startsWith('uploads/')) {
            mediaPath = 'public/' + mediaPath;
        }
        finalMediaUrl = `${API_URL}/${mediaPath}`;
    }

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

    let totalBill = null;
    if (warrantyDetails && !request.warrantyInfo.inWarranty && request.serviceOutcome === 'Repaired') {
        const partsCost = request.repairedParts?.reduce((acc, part) => acc + (part.cost || 0), 0) || 0;
        totalBill = (warrantyDetails.serviceCharge || 0) + (warrantyDetails.replacementCharge || 0) + partsCost;
    }

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-75 transition-opacity z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Request Details
                        </h3>
                        {request.jcNumber && (
                            <p className="mt-1 text-sm text-gray-500">Job Card #: {request.jcNumber}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column for Details */}
                        <div className="space-y-4">
                            {/* Product Details */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-700">Product Information</h4>
                                <DetailItem label="Product Name" value={request.product?.model?.name} />
                                <DetailItem label="Serial Number" value={request.product?.serialNumber} />
                            </div>

                            {/* Customer Details */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">Customer Information</h4>
                                <DetailItem label="Customer Name" value={request.customer?.name} />
                                <DetailItem label="Customer Phone" value={request.customer?.phone} />
                                <DetailItem label="Customer Address" value={request.customer?.address} />
                            </div>

                            {/* Complaint Details */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">Complaint Details</h4>
                                <DetailItem label="Complaint Description" value={request.complaintDescription || request.reason} />
                                <DetailItem label="Preferred Visit Date" value={request.preferredVisitDate ? new Date(request.preferredVisitDate).toLocaleDateString() : 'N/A'} />
                            </div>

                            {/* Status & Warranty */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">Status & Warranty</h4>
                                <DetailItem label="Status" value={request.status} />
                                <DetailItem label="Warranty" value={request.warrantyInfo?.inWarranty ? 'In Warranty' : 'Out of Warranty'} />
                            </div>
                            
                            {/* Billing Information */}
                            {warrantyDetails && (
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-700">Billing Information</h4>
                                    <DetailItem label="Service Charge" value={warrantyDetails.serviceCharge} isCurrency />
                                    <DetailItem label="Replacement Charge" value={warrantyDetails.replacementCharge} isCurrency />
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

                        {/* Right Column for Attached Media */}
                        {request.mediaUrl && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">Attached Media</h4>
                                <div className="mt-2">
                                    {request.mediaUrl.match(/.(jpeg|jpg|gif|png)$/) ? (
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
