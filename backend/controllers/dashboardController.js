import Factory from '../models/Factory.js';
import Order from '../models/Order.js';
// import Product from '../models/Product.js';
import Dealer from '../models/Dealer.js';
import Distributor from '../models/Distributor.js';
import Model from '../models/Model.js';

export const getDashboardCounts = async (req, res) => {
    try {
        const factoryCount = await Factory.countDocuments();
        const orderCount = await Order.countDocuments();
        // const productCount = await Product.countDocuments();
        const dealerCount = await Dealer.countDocuments();
        const distributorCount = await Distributor.countDocuments();
        const modelCount = await Model.countDocuments();

        res.json({
            factories: factoryCount,
            orders: orderCount,
            // products: productCount,
            dealers: dealerCount,
            distributors: distributorCount,
            models: modelCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
