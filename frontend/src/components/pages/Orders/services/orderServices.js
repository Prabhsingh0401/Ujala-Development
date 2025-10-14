import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;

export const orderService = {
  fetchOrders: () => axios.get(API_URL),
  fetchFactories: () => axios.get(`${import.meta.env.VITE_API_URL}/api/factories`),
  fetchCategories: () => axios.get(`${import.meta.env.VITE_API_URL}/api/categories`),
  fetchModels: () => axios.get(`${import.meta.env.VITE_API_URL}/api/models`),
  createOrder: (orderData) => axios.post(API_URL, orderData),
  updateOrder: (id, orderData) => axios.patch(`${API_URL}/${id}`, orderData),
  deleteOrder: (id) => axios.delete(`${API_URL}/${id}`),
  updateOrderStatus: (id, status) => axios.patch(`${API_URL}/${id}/status`, { status }),
  transferToProducts: (orderItemIds) => axios.post(`${API_URL}/transfer-to-products`, { orderItemIds }),
  fetchOrderStats: (id) => axios.get(`${API_URL}/${id}/factory-stats`),
  fetchOrderItems: (id) => axios.get(`${API_URL}/${id}/items`),
};