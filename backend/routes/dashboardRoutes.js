import express from 'express';
import {
    getDashboardStats, 
    getOrderStats
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/counts', getDashboardStats); 
router.get('/stats', getOrderStats);

export default router;