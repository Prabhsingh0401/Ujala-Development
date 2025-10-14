import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

// @desc    Get all products for a distributor (from query param)
// @route   GET /api/distributor/products?distributorId=...
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
    const { distributorId } = req.query;
    const products = await Product.find({ distributor: distributorId });
    res.json(products);
});

// @desc    Get products for a specific distributor (from URL param)
// @route   GET /api/distributor/products/:distributorId
// @access  Private
const getDistributorProducts = asyncHandler(async (req, res) => {
    const { distributorId } = req.params;
    const products = await Product.find({ distributor: distributorId }).populate('category model factory');
    res.json(products);
});

// @desc    Create a new product for a distributor
// @route   POST /api/distributor/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
    const { productName, description, category, price, unit, quantity, minStockLevel, status, distributorId } = req.body;

    const product = new Product({
        productName,
        description,
        category,
        price,
        unit,
        quantity,
        minStockLevel,
        status,
        distributor: distributorId
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product for a distributor
// @route   PUT /api/distributor/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    const { productName, description, category, price, unit, quantity, minStockLevel, status, distributorId } = req.body;

    const product = await Product.findById(req.params.id);

    if (product && product.distributor.toString() === distributorId) {
        product.productName = productName;
        product.description = description;
        product.category = category;
        product.price = price;
        product.unit = unit;
        product.quantity = quantity;
        product.minStockLevel = minStockLevel;
        product.status = status;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found or not authorized');
    }
});

// @desc    Delete a product for a distributor
// @route   DELETE /api/distributor/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
    const { distributorId } = req.body;
    const product = await Product.findById(req.params.id);

    if (product && product.distributor.toString() === distributorId) {
        await product.remove();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found or not authorized');
    }
});

const assignProductsToDistributor = asyncHandler(async (req, res) => {
    const { productIds, distributorId } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        res.status(400);
        throw new Error('Product IDs array is required');
    }

    if (!distributorId) {
        res.status(400);
        throw new Error('Distributor ID is required');
    }

    const updatedProducts = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { distributor: distributorId } }
    );

    if (updatedProducts.modifiedCount === 0) {
        res.status(404);
        throw new Error('No products found or updated');
    }

    res.json({ message: `${updatedProducts.modifiedCount} products assigned to distributor ${distributorId}` });
});

export { getProducts, getDistributorProducts, createProduct, updateProduct, deleteProduct, assignProductsToDistributor };