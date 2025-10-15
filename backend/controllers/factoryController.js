import Factory from '../models/Factory.js';
import Order, { OrderItem } from '../models/Order.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

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
            const orderCount = await OrderItem.countDocuments({ factory: factory._id });
            return {
                ...factory.toObject(),
                orderCount
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

        if (req.body.code && req.body.code !== factory.code) {
            const existingFactory = await Factory.findOne({ code: req.body.code });
            if (existingFactory) {
                return res.status(400).json({ message: 'Code already assigned. Please choose a different code.' });
            }
        }

        const updatedFactory = await Factory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

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

export const getFactoryOrders = async (req, res) => {
    try {
        const factory = await Factory.findById(req.params.id);
        if (!factory) {
            return res.status(404).json({ message: 'Factory not found' });
        }

        const orderItems = await OrderItem.find({ factory: factory._id })
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

        orderItem.status = status;

        if (status === 'Pending') {
            orderItem.completedAt = null;
            orderItem.dispatchedAt = null;
        } else if (status === 'Completed') {
            orderItem.completedAt = new Date();
            orderItem.dispatchedAt = null;
        } else if (status === 'Dispatched') {
            orderItem.dispatchedAt = new Date();
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

        if (status === 'Dispatched') {
            const itemsToUpdate = await OrderItem.find({ _id: { $in: itemIds } });
            
            const allAreCompleted = itemsToUpdate.every(item => item.status === 'Completed');
            
            if (!allAreCompleted) {
                return res.status(400).json({ message: 'Error: All selected items must be in "Completed" status before they can be dispatched.' });
            }
        }

        let update = { status };

        if (status === 'Pending') {
            update.completedAt = null;
            update.dispatchedAt = null;
        } else if (status === 'Completed') {
            update.completedAt = now;
            update.dispatchedAt = null;
        } else if (status === 'Dispatched') {
            update.dispatchedAt = now;
        }

        await OrderItem.updateMany(
            { _id: { $in: itemIds } },
            { $set: update }
        );

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