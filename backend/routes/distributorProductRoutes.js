import express from 'express';
const router = express.Router();
import { getProducts, createProduct, updateProduct, deleteProduct, assignProductsToDistributor, getDistributorProducts, assignProductBySerial } from '../controllers/distributorProductController.js';
import { protect } from '../middleware/authMiddleware.js';


router.route('/').get(getProducts).post(createProduct);
router.get('/:distributorId', getDistributorProducts); // New route to get products for a specific distributor
router.put('/assign', assignProductsToDistributor); // New route for assigning products
router.put('/assign-by-serial', protect, assignProductBySerial);
router.route('/:id').put(updateProduct).delete(deleteProduct);

export default router;