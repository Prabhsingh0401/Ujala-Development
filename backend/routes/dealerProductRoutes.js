import express from 'express';
const router = express.Router();
import { assignProductToDealerBySerial, getProductBySerialNumber } from '../controllers/dealerProductController.js';
import { verifyToken, checkPermission } from '../middleware/roleMiddleware.js';

router.put('/assign-by-serial', verifyToken, checkPermission('dealers', 'modify'), assignProductToDealerBySerial);
router.get('/serial/:serialNumber', verifyToken, getProductBySerialNumber);

export default router;
