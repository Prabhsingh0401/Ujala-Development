import express from 'express';
import {
    createDealerDeletionRequest,
    getDealerDeletionRequests,
    approveDealerDeletionRequest,
    declineDealerDeletionRequest,
} from '../controllers/dealerDeletionRequestController.js';
import { verifyToken } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createDealerDeletionRequest);
router.get('/', verifyToken, getDealerDeletionRequests);
router.delete('/:id/approve', verifyToken, approveDealerDeletionRequest);
router.delete('/:id/decline', verifyToken, declineDealerDeletionRequest);

export default router;
