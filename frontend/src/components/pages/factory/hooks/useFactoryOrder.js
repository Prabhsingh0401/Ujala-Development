import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/api/factories`;

export const useFactoryOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        if (!user || !user.factory) return;
        setLoading(true);
        try {
            const { data: allOrderItems } = await axios.get(`${API_URL}/${user.factory._id}/orders`);
            setOrders(allOrderItems);
            setError(null);
        } catch (err) {
            const errorMessage = 'Error fetching factory orders';
            toast.error(errorMessage);
            setError(errorMessage);
            console.error('Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const handleStatusChange = async (itemIds, newStatus) => {
        if (!newStatus) return;

        let itemsToDispatch = [];
        let itemsNotCompleted = [];

        if (newStatus === 'Dispatched') {
            const selectedOrderItems = orders.filter(o => itemIds.includes(o._id));
            itemsToDispatch = selectedOrderItems.filter(item => item.status === 'Completed');
            itemsNotCompleted = selectedOrderItems.filter(item => item.status !== 'Completed');

            if (itemsToDispatch.length === 0) {
                toast.error('No selected items are in "Completed" status to be dispatched.');
                return;
            }
        } else {
            itemsToDispatch = orders.filter(o => itemIds.includes(o._id));
        }

        try {
            if (itemsToDispatch.length > 0) {
                const dispatchableItemIds = itemsToDispatch.map(item => item._id);
                await axios.patch(`${API_URL}/${user.factory._id}/orders/bulk-status`, { itemIds: dispatchableItemIds, status: newStatus });
                toast.success(`Status updated to ${newStatus} for ${dispatchableItemIds.length} items.`);
            }

            if (itemsNotCompleted.length > 0) {
                const serialNumbersNotDispatched = itemsNotCompleted.map(item => item.serialNumber).join(', ');
                toast.warn(`Skipped ${itemsNotCompleted.length} items not in "Completed" status: ${serialNumbersNotDispatched}`);
            }
            fetchOrders(); // Re-fetch to get the latest data
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating status');
            console.error('Status Update Error:', err);
        }
    };

    const downloadMultiplePDFs = async (selectedItems) => {
        const keysToDownload = [...new Set(
            orders
                .filter(item => selectedItems.includes(item._id))
                .map(item => `${item.orderId}-Box-${item.boxNumber}`)
        )];

        if (keysToDownload.length === 0) {
            toast.error('Please select items to download PDFs.');
            return;
        }

        const toastId = toast.loading('Preparing your download...');
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/pdf/download-multiple`,
                { boxKeys: keysToDownload },
                { responseType: 'blob' }
            );

            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `stickers-batch-${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Downloaded ${keysToDownload.length} PDFs successfully!`, { id: toastId });
        } catch (err) {
            toast.error('Error downloading PDFs.', { id: toastId });
            console.error('Download Error:', err);
        }
    };

    return {
        orders,
        loading,
        error,
        fetchOrders,
        handleStatusChange,
        downloadMultiplePDFs,
    };
};