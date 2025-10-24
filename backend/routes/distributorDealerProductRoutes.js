import express from 'express';
import {
    assignProductToDealer,
    getDealerProducts
} from '../controllers/distributorDealerController.js';

const router = express.Router();

router.post('/assign', assignProductToDealer);
router.get('/dealer/:dealerId/products', getDealerProducts);

export default router;
