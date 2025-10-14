import express from 'express';
const router = express.Router();
import { getProducts, createProduct, updateProduct, deleteProduct, assignProductsToDistributor, getDistributorProducts } from '../controllers/distributorProductController.js';


router.route('/').get(getProducts).post(createProduct);
router.get('/:distributorId', getDistributorProducts); // New route to get products for a specific distributor
router.put('/assign', assignProductsToDistributor); // New route for assigning products
router.route('/:id').put(updateProduct).delete(deleteProduct);

export default router;