import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import User from '../models/User.js';
import DistributorDealerProduct from '../models/DistributorDealerProduct.js';

const assignProductToDealerBySerial = asyncHandler(async (req, res) => {
    const { serialNumber } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).populate('dealer');
    if (!user || !user.dealer) {
        res.status(401);
        throw new Error('User is not a dealer');
    }
    const dealerId = user.dealer._id;
    const distributorId = user.dealer.distributor;

    if (!serialNumber) {
        res.status(400);
        throw new Error('Serial number is required');
    }

    const product = await Product.findOne({ serialNumber });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.distributor?.toString() !== distributorId.toString()) {
        res.status(400);
        throw new Error('Product is not assigned to your distributor');
    }

    const existingAssignment = await DistributorDealerProduct.findOne({ product: product._id });
    if (existingAssignment) {
        res.status(400);
        throw new Error('Product already assigned to a dealer');
    }

    await DistributorDealerProduct.create({
        distributor: distributorId,
        dealer: dealerId,
        product: product._id
    });

    res.json({ message: 'Product assigned successfully' });
});

const getProductBySerialNumber = asyncHandler(async (req, res) => {
    const { serialNumber } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId).populate('dealer');
    if (!user || !user.dealer) {
        res.status(401);
        throw new Error('User is not a dealer');
    }
    const dealerId = user.dealer._id;

    const product = await Product.findOne({ serialNumber });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const assignment = await DistributorDealerProduct.findOne({ product: product._id, dealer: dealerId });

    if (!assignment) {
        res.status(404);
        throw new Error('Product not assigned to this dealer');
    }

    res.json(product);
});

export { assignProductToDealerBySerial, getProductBySerialNumber };
