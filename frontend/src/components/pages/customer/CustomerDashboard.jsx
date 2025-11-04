import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShoppingCart, User, Phone, Calendar } from 'lucide-react';

export default function CustomerDashboard() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sales/customer`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSales(res.data);
        } catch (err) {
            toast.error('Error fetching your purchases');
            console.error('Error fetching customer sales:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSales(); }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">My Purchases</h1>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-500">Loading purchases...</p>
                </div>
            ) : sales.length === 0 ? (
                <div className="text-center py-20">
                    <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No purchases yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Buy a product to see it here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sales.map((sale) => {
                        const productName = sale.product?.productName || sale.product?.model?.name || '-';
                        const serial = sale.product?.serialNumber || '-';
                        const soldAt = sale.soldAt ? new Date(sale.soldAt) : new Date(sale.createdAt);
                        const sellerName = sale.dealer?.name || sale.distributor?.name || '-';
                        const warranty = sale.warrantyInfo;

                        return (
                            <div key={sale._id} className="bg-white rounded-lg shadow p-4 flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="text-lg font-semibold text-gray-800">{productName}</div>
                                    <div className="text-sm text-gray-500 mt-1">S/N: {serial}</div>
                                </div>
                                <div className="w-40 text-right">
                                    <div className="text-sm text-gray-600">Bought:</div>
                                    <div className="text-sm font-medium text-gray-800">{soldAt ? soldAt.toLocaleDateString() : '-'}</div>
                                    <div className="mt-3 text-sm text-gray-600">From:</div>
                                    <div className="text-sm font-medium text-gray-800">{sellerName}</div>
                                    <div className="mt-3">
                                        <div className="text-sm text-gray-600">Plumber:</div>
                                        <div className="text-sm font-medium text-gray-800">{sale.plumberName || '-'}</div>
                                        <div className="mt-2">
                                            {warranty ? (
                                                <div>
                                                    <div className={`inline-block px-2 py-1 rounded text-sm ${warranty.inWarranty ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {warranty.inWarranty ? 'In Warranty' : 'Warranty Expired'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">Expires: {new Date(warranty.expiryDate).toLocaleDateString()}</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">No warranty</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
