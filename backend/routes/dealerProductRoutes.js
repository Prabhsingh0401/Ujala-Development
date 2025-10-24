import express from 'express';
const router = express.Router();
import { assignProductToDealerBySerial } from '../controllers/dealerProductController.js';
import { protect } from '../middleware/authMiddleware.js';

router.put('/assign-by-serial', protect, assignProductToDealerBySerial);

export default router;
