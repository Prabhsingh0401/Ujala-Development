import express from 'express';
const router = express.Router();
import { getDealers, createDealer, updateDealer, deleteDealer, getDistributorDealers } from '../controllers/distributorDealerController.js';


router.route('/').get(getDealers).post(createDealer);
router.get('/:distributorId', getDistributorDealers); // New route to get dealers for a specific distributor
router.route('/:id').put(updateDealer).delete(deleteDealer);

export default router;