import express from 'express';
import {
    getDistributors,
    createDistributor,
    updateDistributor,
    deleteDistributor,
    getDistributorProducts,
    updateDistributorStatus,
    getDistributorDealers
} from '../controllers/distributorController.js';

const router = express.Router();

// @route   GET /api/distributors
router.get('/', getDistributors);

// @route   POST /api/distributors
router.post('/', createDistributor);

// @route   PUT /api/distributors/:id
router.put('/:id', updateDistributor);

// @route   DELETE /api/distributors/:id
router.delete('/:id', deleteDistributor);

// @route   GET /api/distributors/:id/products
router.get('/:id/products', getDistributorProducts);

// @route   PATCH /api/distributors/:id/status
router.patch('/:id/status', updateDistributorStatus);

// @route   GET /api/distributors/:id/dealers
router.get('/:id/dealers', getDistributorDealers);

export default router;