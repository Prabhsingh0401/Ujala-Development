import express from 'express';
import { getProductDetails, updateProductStatus } from '../controllers/qrController.js';

const router = express.Router();


// Route to get product details by serial number
router.get('/:serialNumber', getProductDetails);

// @desc    Update product status by serial number
// @route   PUT /api/qr/:serialNumber/status
// @access  Public
router.put('/:serialNumber/status', updateProductStatus);

export default router;