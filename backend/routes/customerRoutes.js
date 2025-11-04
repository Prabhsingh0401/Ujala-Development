import express from 'express';
import { getCustomers, getCustomerPurchases } from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin-only endpoints
router.get('/', protect, authorize(['admin']), getCustomers);
router.get('/:id/purchases', protect, authorize(['admin']), getCustomerPurchases);

export default router;
