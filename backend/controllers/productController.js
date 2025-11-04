import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category')
            .populate('model')
            .populate('factory')
            .populate('distributor'); // Populate the distributor field
        res.status(200).json(products);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getProductBySerialNumber = async (req, res) => {
    try {
        const { serialNumber } = req.params;
        const product = await Product.findOne({ serialNumber });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};