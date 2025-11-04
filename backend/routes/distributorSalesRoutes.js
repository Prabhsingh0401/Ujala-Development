import express from 'express';
import { getDealerSales, getCustomerSales } from '../controllers/distributorSalesController.js';

const router = express.Router();

router.get('/dealer-sales/:distributorId', getDealerSales);
router.get('/customer-sales/:distributorId', getCustomerSales);

export default router;