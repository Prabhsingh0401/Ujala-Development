import Factory from '../models/Factory.js';
import Order, { OrderItem } from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Model from '../models/Model.js';
import bcrypt from 'bcryptjs';

export const getFactories = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const factories = await Factory.find(query);
        
        const factoriesWithOrders = await Promise.all(factories.map(async (factory) => {
            const user = await User.findOne({ factory: factory._id, role: 'factory' });
            const orderCount = await OrderItem.countDocuments({ factory: factory._id });
            const pendingOrderCount = await OrderItem.countDocuments({ factory: factory._id, status: 'Pending' });
            return {
                ...factory.toObject(),
                username: user ? user.username : '',
                orderCount,
                pendingOrderCount
            };
        }));
        
        res.json(factoriesWithOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFactoryById = async (req, res) => {
    try {
        const factory = await Factory.findById(req.params.id);
        if (!factory) {
            return res.status(404).json({ message: 'Factory not found' });
        }
        res.json(factory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createFactory = async (req, res) => {
    try {
        const { code, username, password, ...factoryData } = req.body;
        
        const existingFactory = await Factory.findOne({ code });
        if (existingFactory) {
            return res.status(400).json({ message: 'Code already assigned. Please choose a different code.' });
        }
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists. Please choose a different username.' });
        }
        
        const factory = new Factory({ code, ...factoryData });
        const createdFactory = await factory.save();
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            password: hashedPassword,
            role: 'factory',
            factory: createdFactory._id
        });
        
        res.status(201).json(createdFactory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateFactory = async (req, res) => {
    try {
        const factory = await Factory.findById(req.params.id);
        if (!factory) {
            return res.status(404).json({ message: 'Factory not found' });
        }

        const { password, ...factoryData } = req.body;

        if (factoryData.code && factoryData.code !== factory.code) {
            const existingFactory = await Factory.findOne({ code: factoryData.code });
            if (existingFactory) {
                return res.status(400).json({ message: 'Code already assigned. Please choose a different code.' });
            }
        }

        const updatedFactory = await Factory.findByIdAndUpdate(
            req.params.id,
            factoryData,
            { new: true, runValidators: true }
        );

        if (password) {
            const user = await User.findOne({ factory: req.params.id, role: 'factory' });
            if (user) {
                user.password = await bcrypt.hash(password, 10);
                await user.save();
            }
        }

        res.json(updatedFactory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteFactory = async (req, res) => {
    try {
        const factory = await Factory.findById(req.params.id);
        if (!factory) {
            return res.status(404).json({ message: 'Factory not found' });
        }

        await User.deleteOne({ factory: factory._id, role: 'factory' });
        
        await factory.deleteOne();
        res.json({ message: 'Factory removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteMultipleFactories = async (req, res) => {
    try {
        const { factoryIds } = req.body;

        if (!factoryIds || factoryIds.length === 0) {
            return res.status(400).json({ message: 'No factory IDs provided' });
        }

        await User.deleteMany({ factory: { $in: factoryIds }, role: 'factory' });
        
        const result = await Factory.deleteMany({ _id: { $in: factoryIds } });

        if (result.deletedCount > 0) {
            res.json({ message: `${result.deletedCount} factories removed` });
        } else {
            res.status(404).json({ message: 'No factories found with the provided IDs' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getFactoryOrders = async (req, res) => {
    try {
        const factory = await Factory.findById(req.params.id);
        if (!factory) {
            return res.status(404).json({ message: 'Factory not found' });
        }

        const { startDate, endDate, modelId } = req.query;
        let filter = { factory: factory._id };

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999)); // End of the day
            }
        }

        if (modelId && modelId !== 'all') {
            filter.model = modelId;
        }

        const orderItems = await OrderItem.find(filter)
            .populate('category')
            .populate('model')
            .populate('factory')
            .sort({ serialNumber: 1 });
        res.json(orderItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderItemStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderItem = await OrderItem.findById(req.params.itemId);

        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        if (status === 'Dispatched' && orderItem.status !== 'Completed') {
            return res.status(400).json({ message: 'Only completed orders can be dispatched.' });
        }

        const oldStatus = orderItem.status;
        orderItem.status = status;

        if (status === 'Pending') {
            orderItem.completedAt = null;
            orderItem.dispatchedAt = null;
        } else if (status === 'Completed') {
            orderItem.completedAt = new Date();
            orderItem.dispatchedAt = null;
            // If changing from Dispatched to Completed, remove from inventory
            if (oldStatus === 'Dispatched' && orderItem.isTransferredToProduct) {
                await Product.deleteOne({ serialNumber: orderItem.serialNumber });
                orderItem.isTransferredToProduct = false;
            }
        } else if (status === 'Dispatched') {
            orderItem.dispatchedAt = new Date();
            // Auto-transfer to inventory
            if (!orderItem.isTransferredToProduct) {
                const latestProduct = await Product.findOne().sort({ productId: -1 });
                let lastNumber = latestProduct ? parseInt(latestProduct.productId.replace('PROD', '')) : 0;
                const newProductId = `PROD${String(lastNumber + 1).padStart(5, '0')}`;

                const productData = {
                    productId: newProductId,
                    productName: (await Model.findById(orderItem.model)).name,
                    description: `Product from Order ${orderItem.orderId}`,
                    serialNumber: orderItem.serialNumber,
                    month: orderItem.month,
                    year: orderItem.year,
                    category: orderItem.category,
                    model: orderItem.model,
                    quantity: 1,
                    orderType: orderItem.orderType,
                    unitsPerBox: orderItem.unitsPerBox,
                    factory: orderItem.factory,
                    orderId: orderItem.orderId,
                    boxNumber: orderItem.boxNumber,
                    unit: 'Piece',
                    price: (await Model.findById(orderItem.model)).specifications?.mrpPrice || 0,
                    minStockLevel: 10,
                    status: 'Active'
                };

                await new Product(productData).save();
                orderItem.isTransferredToProduct = true;
            }
        }

        await orderItem.save();
        res.json(orderItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkUpdateOrderItemStatus = async (req, res) => {
    try {
        const { itemIds, status } = req.body;
        const now = new Date();

        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ message: 'Item IDs are required' });
        }

        const itemsToUpdate = await OrderItem.find({ _id: { $in: itemIds } });

        if (status === 'Dispatched') {
            const allAreCompleted = itemsToUpdate.every(item => item.status === 'Completed');
            if (!allAreCompleted) {
                return res.status(400).json({ message: 'Error: All selected items must be in "Completed" status before they can be dispatched.' });
            }
        }

        // Handle bulk transfers and status changes
        for (const item of itemsToUpdate) {
            const oldStatus = item.status;
            item.status = status;

            if (status === 'Pending') {
                item.completedAt = null;
                item.dispatchedAt = null;
            } else if (status === 'Completed') {
                item.completedAt = now;
                item.dispatchedAt = null;
                // Remove from inventory if changing from Dispatched
                if (oldStatus === 'Dispatched' && item.isTransferredToProduct) {
                    await Product.deleteOne({ serialNumber: item.serialNumber });
                    item.isTransferredToProduct = false;
                }
            } else if (status === 'Dispatched') {
                item.dispatchedAt = now;
                // Auto-transfer to inventory
                if (!item.isTransferredToProduct) {
                    const latestProduct = await Product.findOne().sort({ productId: -1 });
                    let lastNumber = latestProduct ? parseInt(latestProduct.productId.replace('PROD', '')) : 0;
                    const newProductId = `PROD${String(lastNumber + 1).padStart(5, '0')}`;

                    const model = await Model.findById(item.model);
                    const productData = {
                        productId: newProductId,
                        productName: model.name,
                        description: `Product from Order ${item.orderId}`,
                        serialNumber: item.serialNumber,
                        month: item.month,
                        year: item.year,
                        category: item.category,
                        model: item.model,
                        quantity: 1,
                        orderType: item.orderType,
                        unitsPerBox: item.unitsPerBox,
                        factory: item.factory,
                        orderId: item.orderId,
                        boxNumber: item.boxNumber,
                        unit: 'Piece',
                        price: model.specifications?.mrpPrice || 0,
                        minStockLevel: 10,
                        status: 'Active'
                    };

                    await new Product(productData).save();
                    item.isTransferredToProduct = true;
                }
            }

            await item.save();
        }

        const updatedItems = await OrderItem.find({ _id: { $in: itemIds } })
            .populate('category')
            .populate('model');

        res.json(updatedItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFactorySales = async (req, res) => {

    try {

        const factory = await Factory.findById(req.params.id);

        if (!factory) {

            return res.status(404).json({ message: 'Factory not found' });

        }



        const orderItems = await OrderItem.find({ factory: factory._id, status: 'Dispatched' })

            .populate('category')

            .populate('model')

            .populate('factory')

            .sort({ serialNumber: 1 });

        res.json(orderItems);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

};



export const checkFactoryCodeUniqueness = async (req, res) => {

    try {

        const { code } = req.params;

        const existingFactory = await Factory.findOne({ code });

        res.json({ isUnique: !existingFactory });

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

};



export const getNewOrdersCount = async (req, res) => {

    try {

        const factory = await Factory.findById(req.params.id);

        if (!factory) {

            return res.status(404).json({ message: 'Factory not found' });

        }



        const newOrdersCount = await OrderItem.countDocuments({

            factory: factory._id,

            createdAt: { $gt: factory.lastViewedOrdersTimestamp }

        });



        res.json({ newOrdersCount });

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

};



export const markOrdersSeen = async (req, res) => {

    try {

        const factory = await Factory.findById(req.params.id);

        if (!factory) {

            return res.status(404).json({ message: 'Factory not found' });

        }



        factory.lastViewedOrdersTimestamp = Date.now();

        await factory.save();



        res.json({ message: 'Orders marked as seen', lastViewedOrdersTimestamp: factory.lastViewedOrdersTimestamp });

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

};
