import { OrderItem } from '../models/Order.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

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
        
        const product = await Product.findOne({ serialNumber });
        let saleDetails = null;
        let warrantyStatus = 'Not applicable';

        if (product) {
            const sale = await Sale.findOne({ product: product._id })
                .populate('dealer')
                .populate('distributor');
            
            if (sale) {
                const saleDate = new Date(sale.saleDate);
                const warrantyEndDate = new Date(saleDate.setFullYear(saleDate.getFullYear() + 1));
                warrantyStatus = new Date() < warrantyEndDate ? 'Under Warranty' : 'Warranty Expired';

                saleDetails = {
                    soldBy: sale.dealer ? sale.dealer.name : (sale.distributor ? sale.distributor.name : 'Unknown'),
                    saleDate: sale.saleDate,
                    warrantyStatus,
                };
            }
        }

        const productDetails = {
            serialNumber: orderItem.serialNumber,
            orderId: orderItem.orderId,
            category: orderItem.category?.name,
            model: {
                name: orderItem.model?.name,
                specifications: orderItem.model?.specifications
            },
            factory: orderItem.factory ? { id: orderItem.factory._id, name: orderItem.factory.name } : null,
            status: orderItem.status,
            orderType: orderItem.orderType,
            boxNumber: orderItem.boxNumber,
            manufacturingDate: orderItem.createdAt,
            ...saleDetails
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