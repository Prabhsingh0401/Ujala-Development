import express from 'express';
import { createDistributorRequest, getPendingDistributorRequests, approveDistributorRequest, rejectDistributorRequest } from '../controllers/distributorRequestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for submitting a distributor registration request
router.post('/', createDistributorRequest);

// Admin routes for managing distributor requests
router.get('/pending', protect, authorize(['admin']), getPendingDistributorRequests);
router.put('/:id/approve', protect, authorize(['admin']), approveDistributorRequest);
router.put('/:id/reject', protect, authorize(['admin']), rejectDistributorRequest);

export default router;