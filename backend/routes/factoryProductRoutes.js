import express from 'express';
const router = express.Router();

// @route   GET /api/factory/products
router.get('/', (req, res) => {
    res.send('Get all products for a factory');
});

// @route   POST /api/factory/products
router.post('/', (req, res) => {
    res.send('Create a new product for a factory');
});

// @route   PUT /api/factory/products/:id
router.put('/:id', (req, res) => {
    res.send('Update a product for a factory');
});

// @route   DELETE /api/factory/products/:id
router.delete('/:id', (req, res) => {
    res.send('Delete a product for a factory');
});

export default router;