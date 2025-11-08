import ReplacementRequest from '../models/ReplacementRequest.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

export const createReplacementRequest = async (req, res) => {
    try {
        const { productId, reason } = req.body;
        const customerId = req.user.id;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const sale = await Sale.findOne({ product: productId });

        if (!sale) {
            return res.status(404).json({ message: 'Sale information not found' });
        }

        const saleDate = new Date(sale.saleDate);
        const warrantyEndDate = new Date(new Date(saleDate).setFullYear(saleDate.getFullYear() + 1));
        const isWarrantyActive = new Date() < warrantyEndDate;

        if (!isWarrantyActive) {
            return res.status(400).json({ message: 'Product is not under warranty' });
        }

        const existingRequest = await ReplacementRequest.findOne({ product: productId });

        if (existingRequest) {
            if (existingRequest.status === 'Rejected') {
                await ReplacementRequest.findByIdAndDelete(existingRequest._id);
            } else {
                return res.status(400).json({ message: 'A replacement request for this product already exists' });
            }
        }

        const replacementRequest = new ReplacementRequest({
            product: productId,
            customer: customerId,
            reason: reason,
        });

        await replacementRequest.save();

        product.status = 'Replacement Requested';
        await product.save();

        res.status(201).json(replacementRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReplacementRequests = async (req, res) => {
    try {
        const requests = await ReplacementRequest.find()
            .populate({
                path: 'product',
                populate: {
                    path: 'model',
                },
            })
            .populate('customer');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReplacementRequestsByCustomer = async (req, res) => {
    try {
        const customerId = req.user.id;
        const requests = await ReplacementRequest.find({ customer: customerId })
            .populate({
                path: 'product',
                populate: {
                    path: 'model',
                },
            });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateReplacementRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await ReplacementRequest.findById(id);

        if (!request) {
            return res.status(404).json({ message: 'Replacement request not found' });
        }

        request.status = status;
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
