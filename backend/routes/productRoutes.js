import express from 'express';
import { getProducts, getProductBySerialNumber } from '../controllers/productController.js';
import { verifyToken, checkSectionAccess } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, checkSectionAccess('products'), getProducts);
router.get('/serial/:serialNumber', getProductBySerialNumber);

export default router;