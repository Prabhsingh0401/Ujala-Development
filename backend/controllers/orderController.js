
import mongoose from 'mongoose';
import Order, { OrderItem, FactoryCounter } from '../models/Order.js';
import Product from '../models/Product.js';
import Factory from '../models/Factory.js';
import Model from '../models/Model.js';

export const getOrders = async (req, res) => {
    try {
        const { factory } = req.query;
        let query = {};

        if (factory) {
            // Find the factory by name to get its ID
            const factoryObj = await Factory.findOne({ name: factory });
            if (factoryObj) {
                query.factory = factoryObj._id;
            } else {
                // If factory not found, return empty array
                return res.status(200).json([]);
            }
        }

        const orders = await Order.find(query)
            .populate('factory')
            .populate('category')
            .populate('model');
        res.status(200).json(orders);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createOrder = async (req, res) => {
    try {
        const { month, year, factory: factoryId, model: modelId, quantity, orderType, ...orderData } = req.body;
        
        // Validate required fields
        if (!month || !year || !factoryId || !modelId || !quantity || !orderType) {
            return res.status(400).json({ message: 'Month, year, factory, model, quantity, and orderType are required' });
        }

        // Set units per box based on order type
        const unitsPerBox = orderType === '2_units' ? 2 : orderType === '3_units' ? 3 : 1;
        // Calculate total individual units (quantity = boxes, totalUnits = individual items)
        const totalUnits = quantity * unitsPerBox;

        // Find factory and model
        const factory = await Factory.findById(factoryId);
        if (!factory) {
            return res.status(404).json({ message: 'Factory not found' });
        }

        const model = await Model.findById(modelId);
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }

        // Generate order ID
        const latestOrder = await Order.findOne().sort({ orderId: -1 });
        let newOrderId;
        if (latestOrder) {
            const lastNumber = parseInt(latestOrder.orderId.replace('ORD', ''));
            newOrderId = `ORD${String(lastNumber + 1).padStart(5, '0')}`;
        } else {
            newOrderId = 'ORD00001';
        }

        // Get or create factory counter
        let factoryCounter = await FactoryCounter.findOne({ factoryId });
        if (!factoryCounter) {
            factoryCounter = new FactoryCounter({ factoryId, counter: 10000 });
        }

        // Generate serial number base: MMYY + FactoryCode + ModelCode
        const monthStr = String(month).padStart(2, '0');
        const yearStr = String(year).slice(-2);
        const serialBase = `${monthStr}${yearStr}${factory.code.toUpperCase()}${model.code.toUpperCase()}`;

        // Create main order
        const order = {
            ...orderData,
            orderId: newOrderId,
            serialNumber: `${serialBase}${factoryCounter.counter + 1}-${factoryCounter.counter + totalUnits}`,
            month,
            year,
            quantity, // This represents boxes
            factory: factoryId,
            model: modelId,
            orderType,
            unitsPerBox,
            totalUnits // Total individual units
        };

        const newOrder = new Order(order);
        await newOrder.save();

        // Create individual order items for each unit
        const orderItems = [];
        for (let i = 1; i <= totalUnits; i++) {
            factoryCounter.counter += 1;
            const itemSerialNumber = `${serialBase}${factoryCounter.counter}`;
            const boxNumber = Math.ceil(i / unitsPerBox);
            
            const orderItem = new OrderItem({
                orderId: newOrderId,
                serialNumber: itemSerialNumber,
                month,
                year,
                category: orderData.category,
                model: modelId,
                factory: factoryId,
                status: 'Pending',
                orderType,
                unitsPerBox,
                boxNumber
            });
            
            orderItems.push(orderItem);
        }

        await OrderItem.insertMany(orderItems);
        await factoryCounter.save();
        
        const populatedOrder = await Order.findById(newOrder._id)
            .populate('factory')
            .populate('category')
            .populate('model');
        
        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updateOrder = async (req, res) => {
    try {
        const { id: _id } = req.params;
        const order = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: `Invalid order ID format: ${_id}` });
        }

        const existingOrder = await Order.findById(_id).populate('factory');
        if (!existingOrder) {
            return res.status(404).json({ message: `Order not found with id: ${_id}` });
        }
        
        if (order.factory) {
            if (!mongoose.Types.ObjectId.isValid(order.factory)) {
                return res.status(400).json({ message: `Invalid factory ID format: ${order.factory}` });
            }
            const factory = await Factory.findById(order.factory);
            if (!factory) {
                return res.status(404).json({ message: `Factory not found with id: ${order.factory}` });
            }
        }

        // Update the main order
        const updatedOrder = await Order.findByIdAndUpdate(_id, { ...order, _id }, { new: true })
            .populate('factory')
            .populate('category')
            .populate('model');

        // Always update OrderItems when factory, category, or model is provided
        const updateData = {};
        if (order.factory) updateData.factory = order.factory;
        if (order.category) updateData.category = order.category;
        if (order.model) updateData.model = order.model;
        
        if (Object.keys(updateData).length > 0) {
            
            // First check if OrderItems exist
            const existingItems = await OrderItem.find({ orderId: existingOrder.orderId });
            
            if (existingItems.length > 0) {
                const updateResult = await OrderItem.updateMany(
                    { orderId: existingOrder.orderId },
                    { $set: updateData }
                );
                
                // Verify the update worked
                const updatedItems = await OrderItem.find({ orderId: existingOrder.orderId });
            } else {
                console.log('No OrderItems found for orderId:', existingOrder.orderId);
            }
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid order ID format' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Delete associated OrderItem records first
        await OrderItem.deleteMany({ orderId: order.orderId });
        
        // Delete the main order
        await Order.deleteOne({ _id: id });
        
        // Reset factory counter based on remaining OrderItems for this factory
        const remainingItems = await OrderItem.find({ factory: order.factory }).sort({ serialNumber: -1 }).limit(1);
        
        if (remainingItems.length === 0) {
            // No remaining items, reset counter to default
            await FactoryCounter.findOneAndUpdate(
                { factoryId: order.factory },
                { counter: 10000 },
                { upsert: true }
            );
        } else {
            // Extract counter from last remaining serial number
            const lastSerial = remainingItems[0].serialNumber;
            const counterMatch = lastSerial.match(/(\d+)$/);
            if (counterMatch) {
                const lastCounter = parseInt(counterMatch[1]);
                await FactoryCounter.findOneAndUpdate(
                    { factoryId: order.factory },
                    { counter: lastCounter },
                    { upsert: true }
                );
            }
        }
        
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send('No order with that id');
    }

    // Validate status value
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
    }
    
    try {
        // Check if the order exists first
        const existingOrder = await Order.findById(id);
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('factory')
         .populate('category')
         .populate('model');
        
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const cleanupOrphanedOrderItems = async (req, res) => {
    try {
        // Find all OrderItem records
        const orderItems = await OrderItem.find({});
        
        // Get all existing Order IDs
        const existingOrders = await Order.find({}, { orderId: 1 });
        const existingOrderIds = existingOrders.map(order => order.orderId);
        
        // Find orphaned OrderItems
        const orphanedItems = orderItems.filter(item => !existingOrderIds.includes(item.orderId));
        
        if (orphanedItems.length > 0) {
            // Delete orphaned OrderItems
            const orphanedOrderIds = orphanedItems.map(item => item.orderId);
            await OrderItem.deleteMany({ orderId: { $in: orphanedOrderIds } });
            
            res.json({ 
                message: `Cleaned up ${orphanedItems.length} orphaned order items`,
                deletedOrderIds: orphanedOrderIds
            });
        } else {
            res.json({ message: 'No orphaned order items found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resetFactoryCounters = async (req, res) => {
    try {
        const factories = await Factory.find({});
        const resetResults = [];
        
        for (const factory of factories) {
            // Find the highest counter for this factory
            const lastItem = await OrderItem.findOne({ factory: factory._id })
                .sort({ serialNumber: -1 })
                .limit(1);
            
            let newCounter = 10000; // default
            
            if (lastItem) {
                // Extract counter from serial number
                const counterMatch = lastItem.serialNumber.match(/(\d+)$/);
                if (counterMatch) {
                    newCounter = parseInt(counterMatch[1]);
                }
            }
            
            // Update or create factory counter
            await FactoryCounter.findOneAndUpdate(
                { factoryId: factory._id },
                { counter: newCounter },
                { upsert: true }
            );
            
            resetResults.push({
                factoryId: factory._id,
                factoryName: factory.name,
                resetTo: newCounter
            });
        }
        
        res.json({
            message: 'Factory counters reset successfully',
            results: resetResults
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderFactoryStats = async (req, res) => {
    try {
        const { id } = req.params; // order ID
        
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Get all order items for this order
        const orderItems = await OrderItem.find({ orderId: order.orderId });
        
        // Calculate completion stats
        const totalItems = orderItems.length;
        const completedItems = orderItems.filter(item => item.status === 'Completed').length;
        const pendingItems = totalItems - completedItems;
        
        res.json({
            orderId: order.orderId,
            factoryName: order.factory?.name,
            totalItems,
            completedItems,
            pendingItems,
            completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderItems = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderItems = await OrderItem.find({ orderId: order.orderId })
            .populate('category')
            .populate('model')
            .populate('factory')
            .sort({ serialNumber: 1 });

        res.json(orderItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const transferToProducts = async (req, res) => {
    try {
        const { orderItemIds } = req.body;

        if (!orderItemIds || !Array.isArray(orderItemIds)) {
            return res.status(400).json({ message: 'orderItemIds must be provided as an array' });
        }

        const validIds = orderItemIds.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!validIds) {
            return res.status(400).json({ message: 'Invalid order item ID(s)' });
        }

        const orderItems = await OrderItem.find({
            _id: { $in: orderItemIds },
            status: 'Completed',
            isTransferredToProduct: { $ne: true }
        })
        .populate('factory')
        .populate('category')
        .populate('model');
        
        if (orderItems.length === 0) {
            return res.status(400).json({ 
                message: 'No valid completed order items found or items already transferred'
            });
        }

        const convertedProducts = [];
        const errors = [];

        const latestProduct = await Product.findOne().sort({ productId: -1 });
        let lastNumber = 0;
        if (latestProduct && latestProduct.productId) {
            lastNumber = parseInt(latestProduct.productId.replace('PROD', ''));
        }

        for (const item of orderItems) {
            try {
                lastNumber++;
                const newProductId = `PROD${String(lastNumber).padStart(5, '0')}`;

                const productData = {
                    productId: newProductId,
                    productName: item.model.name,
                    description: `Product from Order ${item.orderId}`,
                    serialNumber: item.serialNumber,
                    month: item.month,
                    year: item.year,
                    category: item.category,
                    model: item.model,
                    quantity: 1, // Each order item is a single product
                    orderType: item.orderType,
                    unitsPerBox: item.unitsPerBox,
                    factory: item.factory,
                    orderId: item.orderId,
                    boxNumber: item.boxNumber,
                    unit: 'Piece',
                    price: item.model.specifications?.mrpPrice || 0,
                    minStockLevel: 10,
                    status: 'Active'
                };

                const product = new Product(productData);
                const savedProduct = await product.save();
                convertedProducts.push(savedProduct);

                item.isTransferredToProduct = true;
                await item.save();

            } catch (error) {
                errors.push({ orderItemId: item._id, error: error.message });
            }
        }

        // Also update the main order if all items are transferred
        const orderIds = [...new Set(orderItems.map(item => item.orderId))];
        for (const orderId of orderIds) {
            const allItems = await OrderItem.find({ orderId: orderId });
            const allTransferred = allItems.every(item => item.isTransferredToProduct);
            if (allTransferred) {
                await Order.findOneAndUpdate({ orderId: orderId }, { isTransferredToProduct: true });
            }
        }

        res.status(200).json({
            message: 'Order items processed',
            convertedProducts,
            errors,
            successCount: convertedProducts.length,
            errorCount: errors.length
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error converting order items to products',
            error: error.message 
        });
    }
};
