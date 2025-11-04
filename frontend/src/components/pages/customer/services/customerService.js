import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getCustomers = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API}/api/customers`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

const getCustomerPurchases = async (customerId) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API}/api/customers/${customerId}/purchases`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export { getCustomers, getCustomerPurchases };
