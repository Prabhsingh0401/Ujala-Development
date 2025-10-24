
import express from 'express';
import { getOrders, createOrder, updateOrder, deleteOrder, deleteMultipleOrders, updateOrderStatus, markOrderAsDispatched, transferToProducts, cleanupOrphanedOrderItems, resetFactoryCounters, getOrderFactoryStats, getOrderItems, getAllOrderItems } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.patch('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.delete('/', deleteMultipleOrders);
router.patch('/:id/status', updateOrderStatus);
router.put('/:id/dispatch', markOrderAsDispatched);
router.get('/:id/factory-stats', getOrderFactoryStats);
router.get('/:id/items', getOrderItems);
router.get('/items', getAllOrderItems);
router.post('/transfer-to-products', transferToProducts);
router.delete('/cleanup-orphaned', cleanupOrphanedOrderItems);
router.post('/reset-counters', resetFactoryCounters);

export default router;
