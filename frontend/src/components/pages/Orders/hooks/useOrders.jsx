import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderServices';
import { toast } from 'react-hot-toast';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [factories, setFactories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTabs, setStatusTabs] = useState([
    { key: 'all', label: 'All', count: 0 },
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'completed', label: 'Completed', count: 0 }
  ]);

  const updateStatusTabCounts = useCallback((ordersList) => {
    const counts = ordersList.reduce(
      (acc, order) => {
        if (order.status === 'Pending') acc.pending++;
        else if (order.status === 'Completed') acc.completed++;
        acc.all++;
        return acc;
      },
      { all: 0, pending: 0, completed: 0 }
    );

    setStatusTabs(prevTabs =>
      prevTabs.map(tab => ({
        ...tab,
        count: counts[tab.key]
      }))
    );
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, factoriesRes, categoriesRes, modelsRes] = await Promise.all([
        orderService.fetchOrders(),
        orderService.fetchFactories(),
        orderService.fetchCategories(),
        orderService.fetchModels()
      ]);

      setOrders(ordersRes.data);
      updateStatusTabCounts(ordersRes.data);
      setFactories(Array.isArray(factoriesRes.data) ? factoriesRes.data : []);
      setCategories(categoriesRes.data.filter(cat => cat.status === 'Active'));
      setModels(modelsRes.data.filter(model => model.status === 'Active'));
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error fetching data:', error);
      setFactories([]);
      setCategories([]);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [updateStatusTabCounts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addOrder = async (orderData) => {
    try {
      const { data } = await orderService.createOrder(orderData);
      setOrders([...orders, data]);
      updateStatusTabCounts([...orders, data]);
      toast.success('Order added successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding order');
      console.error('Error adding order:', error);
      return false;
    }
  };

  const updateOrder = async (id, orderData) => {
    try {
      const { data } = await orderService.updateOrder(id, orderData);
      const updatedOrders = orders.map(order => order._id === id ? data : order);
      setOrders(updatedOrders);
      updateStatusTabCounts(updatedOrders);
      toast.success('Order updated successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating order');
      console.error('Error updating order:', error);
      return false;
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return false;

    try {
      await orderService.deleteOrder(id);
      const updatedOrders = orders.filter(order => order._id !== id);
      setOrders(updatedOrders);
      updateStatusTabCounts(updatedOrders);
      toast.success('Order deleted successfully');
      return true;
    } catch (error) {
      toast.error('Error deleting order');
      console.error('Error deleting order:', error);
      return false;
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const { data } = await orderService.updateOrderStatus(id, status);
      const updatedOrders = orders.map(order => order._id === id ? data : order);
      setOrders(updatedOrders);
      updateStatusTabCounts(updatedOrders);
      toast.success(`Order status updated to ${status}`);
      return true;
    } catch (error) {
      toast.error('Error updating order status');
      console.error('Error updating order status:', error);
      return false;
    }
  };

  const transferToProducts = async (orderItemIds) => {
    if (orderItemIds.length === 0) {
      toast.error('Please select items to transfer');
      return false;
    }

    try {
      const response = await orderService.transferToProducts(orderItemIds);

      if (response.data.successCount > 0) {
        toast.success(`Successfully transferred ${response.data.successCount} items to products`);
        await fetchData();
      }

      if (response.data.errors?.length > 0) {
        const errorMessages = response.data.errors
          .map(err => `Item ${err.orderItemId}: ${err.error}`)
          .join('\n');
        toast.error(
          <div><b>Some items failed to transfer:</b><br/><pre>{errorMessages}</pre></div>,
          { duration: 5000 }
        );
      }

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to transfer items to products');
      console.error('Transfer error:', error);
      return false;
    }
  };

  return {
    orders,
    factories,
    categories,
    models,
    loading,
    statusTabs,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    transferToProducts,
    refreshOrders: fetchData
  };
};