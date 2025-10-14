import express from 'express';
import {
    getDealers,
    createDealer,
    updateDealer,
    deleteDealer
} from '../controllers/dealerController.js';

const router = express.Router();

// @route   GET /api/dealers
router.get('/', getDealers);

// @route   POST /api/dealers
router.post('/', createDealer);

// @route   PUT /api/dealers/:id
router.put('/:id', updateDealer);

// @route   DELETE /api/dealers/:id
router.delete('/:id', deleteDealer);

export default router;