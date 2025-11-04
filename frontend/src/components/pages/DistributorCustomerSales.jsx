import { ShoppingCart, QrCode, User, Phone, Calendar } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { distributorSalesService } from '../../services/distributorSalesService';
import { toast } from 'react-hot-toast';
import SellQRScannerModal from '../global/SellQRScannerModal';
import SaleModal from '../pages/Dealers/components/SaleModal';
import { createSale } from '../pages/Dealers/services/dealerSalesService';

export default function DistributorCustomerSales() {
    const { user } = useContext(AuthContext);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [scannedProduct, setScannedProduct] = useState(null);

    const fetchSales = async () => {
        if (!user || !user.distributor) {
            setLoading(false);
            return;
        }
        try {
            const response = await distributorSalesService.getCustomerSales(user.distributor._id);
            setSales(response.data);
        } catch (error) {
            toast.error('Error fetching customer sales');
            console.error('Error fetching customer sales:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [user]);

    // Handle product scanned from QR
    const handleProductScanned = (product) => {
        const group = {
            _id: product._id,
            productName: product.productName,
            productsInBox: [product],
        };
        setScannedProduct(group);
        setShowScannerModal(false);
        setShowSaleModal(true);
    };

    // Handle product sale
    const handleSale = async (customerData) => {
        if (!scannedProduct) return;

        try {
            for (const product of scannedProduct.productsInBox) {
                await createSale({
                    productId: product._id,
                    distributorId: user.distributor._id,
                    ...customerData,
                });
            }
            toast.success('Product sold successfully');
            setShowSaleModal(false);
            setScannedProduct(null);
            fetchSales();
        } catch (error) {
            toast.error('Error selling product');
            console.error('Error selling product:', error);
        }
    };

    return (
        <div className="p-6 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Customer Sales</h1>
                    <p className="text-sm text-gray-500">Sell products directly to customers.</p>
                </div>
                <button
                    onClick={() => setShowScannerModal(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                >
                    <QrCode className="mr-3 h-6 w-6" />
                    Scan Product to Sell
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-6 text-gray-500">Loading sales...</p>
                    </div>
                ) : sales.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No sales found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by selling a product.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Product Name
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Serial Number
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Customer Name
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Customer Email
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Customer Phone
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Plumber Name
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Sold At
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sales.map((sale) => (
                                <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {sale.product.productName}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                        {sale.product.serialNumber}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                            {sale.customerName}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                            {sale.customerEmail || '-'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                            {sale.customerPhone}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                            {sale.plumberName || '-'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                            {new Date(sale.soldAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <SellQRScannerModal
                isOpen={showScannerModal}
                onClose={() => setShowScannerModal(false)}
                onProductScanned={handleProductScanned}
            />

            {scannedProduct && (
                <SaleModal
                    isOpen={showSaleModal}
                    onClose={() => setShowSaleModal(false)}
                    group={scannedProduct}
                    onSale={handleSale}
                />
            )}
        </div>
    );
}