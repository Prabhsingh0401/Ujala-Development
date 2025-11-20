import express from 'express';
import {
  getCustomers,
  getCustomerPurchases,
  updateCustomerCredentials,
  checkPhone,
  setCustomerPassword,
  deleteCustomers,
} from '../controllers/customerController.js';import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for customer registration
router.post('/check-phone', checkPhone);
router.post('/set-password', setCustomerPassword);

// Admin-only endpoints
router.get('/', protect, authorize(['admin']), getCustomers);
router.delete('/', protect, authorize(['admin']), deleteCustomers);
router.get('/:id/purchases', protect, authorize(['admin']), getCustomerPurchases);
router.put('/:id/credentials', protect, authorize(['admin']), updateCustomerCredentials);

export default router;
