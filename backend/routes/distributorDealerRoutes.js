import express from 'express';
const router = express.Router();
import { getDealers, createDealer, updateDealer, deleteDealer } from '../controllers/distributorDealerController.js';


router.route('/').get(getDealers).post(createDealer);
router.route('/:id').put(updateDealer).delete(deleteDealer);

export default router;