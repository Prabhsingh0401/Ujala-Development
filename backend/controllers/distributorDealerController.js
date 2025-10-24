import DistributorDealerProduct from '../models/DistributorDealerProduct.js';

export const assignProductToDealer = async (req, res) => {
    try {
        const { distributorId, dealerId, productId } = req.body;

        const assignment = new DistributorDealerProduct({
            distributor: distributorId,
            dealer: dealerId,
            product: productId
        });

        const createdAssignment = await assignment.save();
        res.status(201).json(createdAssignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getDealerProducts = async (req, res) => {
    try {
        const { dealerId } = req.params;

        const products = await DistributorDealerProduct.find({ dealer: dealerId })
            .populate('product')
            .populate('distributor');
            
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};