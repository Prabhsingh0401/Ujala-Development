import { OrderItem } from '../models/Order.js';

export const getProductDetails = async (req, res) => {
    try {
        const { serialNumber } = req.params;
        
        const orderItem = await OrderItem.findOne({ serialNumber })
            .populate('category')
            .populate('model')
            .populate('factory');
        
        if (!orderItem) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const productDetails = {
            serialNumber: orderItem.serialNumber,
            orderId: orderItem.orderId,
            category: orderItem.category?.name,
            model: {
                name: orderItem.model?.name,
                specifications: orderItem.model?.specifications
            },
            factory: orderItem.factory?.name,
            status: orderItem.status,
            orderType: orderItem.orderType,
            boxNumber: orderItem.boxNumber,
            manufacturingDate: orderItem.createdAt
        };
        
        res.json(productDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProductStatus = async (req, res) => {
    try {
        const { serialNumber } = req.params;
        const { status } = req.body;
        
        const orderItem = await OrderItem.findOne({ serialNumber });
        
        if (!orderItem) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        if (orderItem.status === 'Pending') {
            orderItem.status = 'Completed';
            orderItem.completedAt = new Date();
        } else {
            return res.status(400).json({ message: `Cannot change status from ${orderItem.status} to Completed` });
        }
        await orderItem.save();
        
        res.json({ message: 'Product status updated successfully', orderItem });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};