import express from 'express';
import { getFactories, getFactoryById, createFactory, updateFactory, deleteFactory, getFactoryOrders, updateOrderItemStatus, bulkUpdateOrderItemStatus, getFactorySales, deleteMultipleFactories } from '../controllers/factoryController.js';

const router = express.Router();

// @route   GET /api/factories
router.get('/', getFactories);

// @route   GET /api/factories/:id
router.get('/:id', getFactoryById);

// @route   POST /api/factories
router.post('/', createFactory);

// @route   PUT /api/factories/:id
router.put('/:id', updateFactory);

// @route   DELETE /api/factories/:id
router.delete('/:id', deleteFactory);

// @route   DELETE /api/factories/
router.delete('/', deleteMultipleFactories);

// @route   GET /api/factories/:id/orders
router.get('/:id/orders', getFactoryOrders);

// @route   GET /api/factories/:id/sales
router.get('/:id/sales', getFactorySales);

// @route   PATCH /api/factories/:id/orders/:itemId/status
router.patch('/:id/orders/:itemId/status', updateOrderItemStatus);

// @route   PATCH /api/factories/:id/orders/bulk-status
router.patch('/:id/orders/bulk-status', bulkUpdateOrderItemStatus);

export default router;