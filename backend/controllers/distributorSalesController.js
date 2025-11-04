import DistributorDealerProduct from '../models/DistributorDealerProduct.js';
import Sale from '../models/Sale.js';

export const getDealerSales = async (req, res) => {
    try {
        const { distributorId } = req.params;

        const sales = await DistributorDealerProduct.find({
            distributor: distributorId
        })
        .populate({
            path: 'product',
            populate: {
                path: 'model'
            }
        })
        .populate('dealer', 'name');

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCustomerSales = async (req, res) => {
    try {
        const { distributorId } = req.params;

        const sales = await Sale.find({
            distributor: distributorId
        })
        .populate('product')
        .populate('distributor', 'name');

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};