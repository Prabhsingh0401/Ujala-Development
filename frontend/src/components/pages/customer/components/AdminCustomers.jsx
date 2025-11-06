import React, { useState, useEffect } from 'react';
import { getCustomers, getCustomerPurchases } from '../services/customerService';
import { toast } from 'react-hot-toast';
import { ShoppingCart, X } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [pLoading, setPLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      toast.error('Error fetching customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openPurchases = async (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
    setPLoading(true);
    try {
      const res = await getCustomerPurchases(customer._id);
      setPurchases(res);
    } catch (err) {
      toast.error('Error fetching purchases');
      console.error('Error fetching purchases:', err);
    } finally {
      setPLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading customers...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.address || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => openPurchases(c)} className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {c.purchaseCount || 0} Products
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

     {modalOpen && (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-10">
        <div
          className="fixed inset-0 bg-black/40"
          onClick={() => setModalOpen(false)}
        ></div>

        <div className="relative bg-white rounded-lg shadow-lg w-11/12 max-w-4xl p-6 z-10 overflow-y-auto h-[90vh]">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Purchases - {selectedCustomer?.name}
            </h2>
            <button
              onClick={() => setModalOpen(false)}
              className="text-gray-500 hover:text-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Loading State */}
          {pLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading purchases...</p>
            </div>
          ) : purchases.length === 0 ? (
            /* Empty State */
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No purchases
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This customer hasn't bought any products yet.
              </p>
            </div>
          ) : (
            /* ✅ TABLE VIEW */
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border border-gray-200 divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-700">Product</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Serial No.</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Bought On</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Seller</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Plumber</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Warranty</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {purchases.map((sale) => {
                    const productName =
                      sale.product?.productName ||
                      sale.product?.model?.name ||
                      "-";
                    const serial = sale.product?.serialNumber || "-";
                    const soldAt = sale.soldAt
                      ? new Date(sale.soldAt)
                      : new Date(sale.createdAt);
                    const sellerName =
                      sale.dealer?.name || sale.distributor?.name || "-";
                    const warranty = sale.warrantyInfo;

                    return (
                      <tr key={sale._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{productName}</td>
                        <td className="px-4 py-2 text-gray-600">{serial}</td>
                        <td className="px-4 py-2">{soldAt.toLocaleDateString()}</td>
                        <td className="px-4 py-2">{sellerName}</td>
                        <td className="px-4 py-2">{sale.plumberName || "-"}</td>
                        <td className="px-4 py-2">
                          {warranty ? (
                            <div className="flex flex-col">
                              <span
                                className={`px-2 py-1 rounded w-fit text-xs ${
                                  warranty.inWarranty
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {warranty.inWarranty
                                  ? "In Warranty"
                                  : "Expired"}
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                Expires:{" "}
                                {new Date(warranty.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">No warranty</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )}
    </div>
  );
}
