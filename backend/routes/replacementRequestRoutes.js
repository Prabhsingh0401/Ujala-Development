import express from 'express';
import { createReplacementRequest, getReplacementRequests, updateReplacementRequestStatus, getReplacementRequestsByCustomer } from '../controllers/replacementRequestController.js';
import { verifyToken } from '../middleware/roleMiddleware.js';

const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

router.post('/', verifyToken, createReplacementRequest);
router.get('/', verifyToken, isAdmin, getReplacementRequests);
router.get('/customer', verifyToken, getReplacementRequestsByCustomer);
router.put('/:id', verifyToken, isAdmin, updateReplacementRequestStatus);

export default router;
