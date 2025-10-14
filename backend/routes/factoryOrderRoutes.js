import express from 'express';
const router = express.Router();
import { getOrders, createOrder, updateOrder, deleteOrder, updateOrderStatus } from '../controllers/factoryOrderController.js';

router.route('/').get(getOrders).post(createOrder);
router.route('/:id').put(updateOrder).delete(deleteOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;