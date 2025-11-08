import { OrderItem } from '../models/Order.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import DistributorDealerProduct from '../models/DistributorDealerProduct.js';

export const getProductDetails = async (req, res) => {
    try {
        const { serialNumber } = req.params;
        console.log('Fetching details for serial number:', serialNumber);

        const product = await Product.findOne({ serialNumber })
            .populate('model')
            .populate('distributor')
            .populate('factory');

        console.log('Product query result:', product);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productObj = product.toObject();

        const dealerAssignment = await DistributorDealerProduct.findOne({ product: product._id })
            .populate('dealer');

        console.log('Dealer assignment query result:', dealerAssignment);

        if (dealerAssignment) {
            productObj.dealer = dealerAssignment.dealer;
        }

        const sale = await Sale.findOne({ product: product._id });

        console.log('Sale query result:', sale);

        if (sale) {
            productObj.sale = {
                customerName: sale.customerName || null,
                customerPhone: sale.customerPhone || null,
                customerEmail: sale.customerEmail || null,
                soldAt: sale.soldAt || sale.saleDate || sale.createdAt || null,
                _id: sale._id
            };

            const saleDate = new Date(sale.saleDate);
            const warrantyEndDate = new Date(new Date(saleDate).setFullYear(saleDate.getFullYear() + 1));
            productObj.warrantyStatus = new Date() < warrantyEndDate ? 'Under Warranty' : 'Warranty Expired';
        } else {
            productObj.warrantyStatus = 'Not applicable';
        }
        
        console.log('Final product object:', productObj);
        res.json(productObj);
    } catch (error) {
        console.error('Error in getProductDetails:', error);
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