
import express from 'express';
import { getOrders, createOrder, updateOrder, deleteOrder, updateOrderStatus, transferToProducts, cleanupOrphanedOrderItems, resetFactoryCounters, getOrderFactoryStats, getOrderItems } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.patch('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.patch('/:id/status', updateOrderStatus);
router.get('/:id/factory-stats', getOrderFactoryStats);
router.get('/:id/items', getOrderItems);
router.post('/transfer-to-products', transferToProducts);
router.delete('/cleanup-orphaned', cleanupOrphanedOrderItems);
router.post('/reset-counters', resetFactoryCounters);

export default router;
