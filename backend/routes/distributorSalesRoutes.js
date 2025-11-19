import express from 'express';
import { getDealerSales, getCustomerSales, sellToCustomer } from '../controllers/distributorSalesController.js';

const router = express.Router();

router.get('/dealer-sales/:distributorId', getDealerSales);
router.get('/customer-sales/:distributorId', getCustomerSales);
router.post('/sell-to-customer', sellToCustomer);

export default router;