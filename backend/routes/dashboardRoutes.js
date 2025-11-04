import express from 'express';
import {
    getDashboardStats, 
    getOrderStats,
    getOrderItemStats,
    getMonthlySalesData
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/counts', getDashboardStats); 
router.get('/stats', getOrderStats);
router.get('/order-items', getOrderItemStats);
router.get('/monthly-sales', getMonthlySalesData);

export default router;