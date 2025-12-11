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
            const factoryObj = await Factory.findOne({ name: factory });
            if (factoryObj) {
                query.factory = factoryObj._id;
            } else {
                return res.status(200).json([]);
            }
        }

        const orders = await Order.find(query)
            .populate('factory')
            .populate('category')
            .populate('model');
        
        const ordersWithUnitCounts = await Promise.all(orders.map(async (order) => {
            const pendingUnits = await OrderItem.countDocuments({ orderId: order.orderId, status: 'Pending' });
            const completedUnits = await OrderItem.countDocuments({ orderId: order.orderId, status: 'Completed' });
            const dispatchedUnits = await OrderItem.countDocuments({ orderId: order.orderId, status: 'Dispatched' });
            return { ...order.toObject(), pendingUnits, completedUnits, dispatchedUnits };
        }));

        res.status(200).json(ordersWithUnitCounts);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        const { month, year, factory: factoryId, model: modelId, quantity, orderType, ...orderData } = req.body;
        
        if (!month || !year || !factoryId || !modelId || !quantity || !orderType) {
            return res.status(400).json({ message: 'Month, year, factory, model, quantity, and orderType are required' });
        }

        const unitsPerBox = orderType === '2_units' ? 2 : orderType === '3_units' ? 3 : 1;
        const totalUnits = quantity * unitsPerBox;

        const factory = await Factory.findById(factoryId);
        if (!factory) {
            return res.status(404).json({ message: 'Factory not found' });
        }

        const model = await Model.findById(modelId);
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }

        let result;
        await session.withTransaction(async () => {
            // Generate unique order ID atomically
            const latestOrder = await Order.findOne({}, {}, { sort: { orderId: -1 }, session });
            let newOrderId;
            if (latestOrder) {
                const lastNumber = parseInt(latestOrder.orderId.replace('ORD', ''));
                newOrderId = `ORD${String(lastNumber + 1).padStart(5, '0')}`;
            } else {
                newOrderId = 'ORD00001';
            }

            // FIX: Atomically increment factory counter with proper initialization
            const factoryCounter = await FactoryCounter.findOneAndUpdate(
                { factoryId },
                { 
                    $inc: { counter: totalUnits },
                    $setOnInsert: { counter: 10000 } // Initialize to 10000 on first insert
                },
                { 
                    new: false, // Return the old value before increment
                    upsert: true,
                    session 
                }
            );

            // FIX: Properly handle the counter value
            // If factoryCounter is null, it means document was just created with counter: 10000
            // and then incremented by totalUnits, so we use 10000 as base
            const currentCounter = factoryCounter?.counter || 10000;
            const startCounter = currentCounter + 1;
            const endCounter = currentCounter + totalUnits;

            const monthStr = String(month).padStart(2, '0');
            const yearStr = String(year).slice(-2);
            const factoryCode = factory.code.toUpperCase();
            const modelCode = model.code.toUpperCase();
            
            // Create serial number range for the order
            const orderSerialBase = `${monthStr}${yearStr}${factoryCode}${modelCode}`;
            const orderSerialNumber = `${orderSerialBase}${startCounter}-${endCounter}`;

            const order = {
                ...orderData,
                orderId: newOrderId,
                serialNumber: orderSerialNumber,
                month,
                year,
                quantity,
                factory: factoryId,
                model: modelId,
                orderType,
                unitsPerBox,
                totalUnits
            };

            const newOrder = new Order(order);
            await newOrder.save({ session });

            const orderItems = [];
            for (let i = 0; i < totalUnits; i++) {
                const currentCounter = startCounter + i;
                // Individual items use model-specific serial numbers
                const itemSerialBase = `${monthStr}${yearStr}${factoryCode}${model.code.toUpperCase()}`;
                const itemSerialNumber = `${itemSerialBase}${currentCounter}`;
                const boxNumber = Math.ceil((i + 1) / unitsPerBox);
                
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

            await OrderItem.insertMany(orderItems, { session });
            
            result = await Order.findById(newOrder._id, {}, { session })
                .populate('factory')
                .populate('category')
                .populate('model');
        });
        
        res.status(201).json(result);
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error specifically
            const duplicateField = Object.keys(error.keyPattern || {})[0];
            return res.status(409).json({ 
                message: `Duplicate ${duplicateField} detected. Please try again.`,
                error: 'DUPLICATE_KEY_ERROR'
            });
        }
        res.status(409).json({ message: error.message });
    } finally {
        await session.endSession();
    }
}

export const updateOrder = async (req, res) => {
    try {
        const { id: _id } = req.params;
        const orderData = req.body;

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: `Invalid order ID format: ${_id}` });
        }

        const existingOrder = await Order.findById(_id);
        if (!existingOrder) {
            return res.status(404).json({ message: `Order not found with id: ${_id}` });
        }

        const quantityChanged = orderData.quantity && orderData.quantity !== existingOrder.quantity;
        const orderTypeChanged = orderData.orderType && orderData.orderType !== existingOrder.orderType;

        if (quantityChanged || orderTypeChanged) {
            // Major change, need to regenerate items.

            // 1. Delete old items
            await OrderItem.deleteMany({ orderId: existingOrder.orderId });

            // 2. Recalculate units
            const quantity = orderData.quantity || existingOrder.quantity;
            const orderType = orderData.orderType || existingOrder.orderType;
            const unitsPerBox = orderType === '2_units' ? 2 : orderType === '3_units' ? 3 : 1;
            const totalUnits = quantity * unitsPerBox;

            orderData.unitsPerBox = unitsPerBox;
            orderData.totalUnits = totalUnits;

            // 3. Get related data for serial number generation
            const factoryId = orderData.factory || existingOrder.factory;
            const modelId = orderData.model || existingOrder.model;
            const factory = await Factory.findById(factoryId);
            const model = await Model.findById(modelId);
            if (!factory || !model) {
                return res.status(404).json({ message: 'Factory or Model not found' });
            }

            // FIX: Atomically get new counter range with proper initialization
            const factoryCounter = await FactoryCounter.findOneAndUpdate(
                { factoryId },
                { 
                    $inc: { counter: totalUnits },
                    $setOnInsert: { counter: 10000 } // Initialize to 10000 on first insert
                },
                { 
                    new: false, // Return the old value before increment
                    upsert: true
                }
            );

            // FIX: Properly handle the counter value
            const currentCounter = factoryCounter?.counter || 10000;
            const startCounter = currentCounter + 1;
            const endCounter = currentCounter + totalUnits;

            // 5. Generate new serial number range for Order
            const month = orderData.month || existingOrder.month;
            const year = orderData.year || existingOrder.year;
            const monthStr = String(month).padStart(2, '0');
            const yearStr = String(year).slice(-2);
            const factoryCode = factory.code.toUpperCase();
            const modelCode = model.code.toUpperCase();
            
            // Order serial number
            const orderSerialBase = `${monthStr}${yearStr}${factoryCode}${modelCode}`;
            orderData.serialNumber = `${orderSerialBase}${startCounter}-${endCounter}`;

            // 6. Create new items
            const orderItems = [];
            for (let i = 0; i < totalUnits; i++) {
                const currentCounter = startCounter + i;
                // Individual items use model-specific serial numbers
                const itemSerialBase = `${monthStr}${yearStr}${factoryCode}${model.code.toUpperCase()}`;
                const itemSerialNumber = `${itemSerialBase}${currentCounter}`;
                const boxNumber = Math.ceil((i + 1) / unitsPerBox);
                
                const orderItem = new OrderItem({
                    orderId: existingOrder.orderId, // Use existing orderId
                    serialNumber: itemSerialNumber,
                    month,
                    year,
                    category: orderData.category || existingOrder.category,
                    model: modelId,
                    factory: factoryId,
                    status: 'Pending',
                    orderType,
                    unitsPerBox,
                    boxNumber
                });
                orderItems.push(orderItem);
            }

            // 7. Save items
            await OrderItem.insertMany(orderItems);

            // 8. Update the Order document
            const updatedOrder = await Order.findByIdAndUpdate(_id, orderData, { new: true })
                .populate('factory')
                .populate('category')
                .populate('model');
            
            res.json(updatedOrder);

        } else {
            // Simple update, no quantity/type change
            const updatedOrder = await Order.findByIdAndUpdate(_id, orderData, { new: true })
                .populate('factory')
                .populate('category')
                .populate('model');

            const updateData = {};
            if (orderData.factory) updateData.factory = orderData.factory;
            if (orderData.category) updateData.category = orderData.category;
            if (orderData.model) updateData.model = orderData.model;
            
            if (Object.keys(updateData).length > 0) {
                await OrderItem.updateMany(
                    { orderId: existingOrder.orderId },
                    { $set: updateData }
                );
            }
            res.json(updatedOrder);
        }
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error specifically
            const duplicateField = Object.keys(error.keyPattern || {})[0];
            return res.status(409).json({ 
                message: `Duplicate ${duplicateField} detected. Please try again.`,
                error: 'DUPLICATE_KEY_ERROR'
            });
        }
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

        // Delete associated order items
        await OrderItem.deleteMany({ orderId: order.orderId });
        
        // Delete the order
        await Order.deleteOne({ _id: id });
        
        // FIX: Recalculate factory counter based on highest remaining serial number
        const remainingItems = await OrderItem.find({ factory: order.factory })
            .sort({ serialNumber: -1 })
            .limit(1);
        
        if (remainingItems.length === 0) {
            // No items left for this factory, reset to initial value
            await FactoryCounter.findOneAndUpdate(
                { factoryId: order.factory },
                { counter: 10000 },
                { upsert: true }
            );
        } else {
            // Extract the counter from the last serial number
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

export const deleteMultipleOrders = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Order IDs are required.' });
        }

        const orders = await Order.find({ _id: { $in: ids } });
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found with the provided IDs.' });
        }

        // FIX: Get unique factory IDs safely
        const factoryIdsSet = new Set();
        orders.forEach(order => {
            if (order.factory) {
                // Handle ObjectId or string
                const factoryId = order.factory._id || order.factory;
                factoryIdsSet.add(factoryId.toString());
            }
        });
        const factoryIds = Array.from(factoryIdsSet);

        const orderIds = orders.map(order => order.orderId);
        await OrderItem.deleteMany({ orderId: { $in: orderIds } });
        await Order.deleteMany({ _id: { $in: ids } });

        // Reset counter for each affected factory
        for (const factoryId of factoryIds) {
            const remainingItems = await OrderItem.find({ factory: factoryId })
                .sort({ serialNumber: -1 })
                .limit(1);
            
            if (remainingItems.length === 0) {
                await FactoryCounter.findOneAndUpdate(
                    { factoryId },
                    { counter: 10000 },
                    { upsert: true }
                );
            } else {
                const lastSerial = remainingItems[0].serialNumber;
                const counterMatch = lastSerial.match(/(\d+)$/);
                if (counterMatch) {
                    const lastCounter = parseInt(counterMatch[1]);
                    await FactoryCounter.findOneAndUpdate(
                        { factoryId },
                        { counter: lastCounter },
                        { upsert: true }
                    );
                }
            }
        }

        res.json({ message: 'Orders deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const markOrderAsDispatched = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send('No order with that id');
    }

    try {
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'Completed') {
            return res.status(400).json({ message: 'Order must be completed before it can be dispatched' });
        }
        
        order.status = 'Dispatched';
        order.dispatchedAt = new Date();
        
        const updatedOrder = await order.save();

        await OrderItem.updateMany(
            { orderId: order.orderId },
            { $set: { status: 'Dispatched', dispatchedAt: new Date() } }
        );

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send('No order with that id');
    }

    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled', 'Dispatched'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
    }
    
    try {
        const existingOrder = await Order.findById(id);
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const updateData = { status };
        if (status === 'Completed') {
            updateData.completedAt = new Date();
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('factory')
         .populate('category')
         .populate('model');
        
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await OrderItem.updateMany(
            { orderId: updatedOrder.orderId },
            { $set: updateData }
        );
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const cleanupOrphanedOrderItems = async (req, res) => {
    try {
        const orderItems = await OrderItem.find({});
        
        const existingOrders = await Order.find({}, { orderId: 1 });
        const existingOrderIds = existingOrders.map(order => order.orderId);
        
        const orphanedItems = orderItems.filter(item => !existingOrderIds.includes(item.orderId));
        
        if (orphanedItems.length > 0) {
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
            const lastItem = await OrderItem.findOne({ factory: factory._id })
                .sort({ serialNumber: -1 })
                .limit(1);
            
            let newCounter = 10000;
            
            if (lastItem) {
                const counterMatch = lastItem.serialNumber.match(/(\d+)$/);
                if (counterMatch) {
                    newCounter = parseInt(counterMatch[1]);
                }
            }
            
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

export const cleanupDuplicateSerialNumbers = async (req, res) => {
    try {
        const orderDuplicates = await Order.aggregate([
            { $group: { _id: '$serialNumber', count: { $sum: 1 }, docs: { $push: '$_id' } } },
            { $match: { count: { $gt: 1 } } }
        ]);

        let orderDuplicatesRemoved = 0;
        for (const duplicate of orderDuplicates) {
            const [keep, ...remove] = duplicate.docs;
            if (remove.length > 0) {
                await Order.deleteMany({ _id: { $in: remove } });
                orderDuplicatesRemoved += remove.length;
            }
        }

        const itemDuplicates = await OrderItem.aggregate([
            { $group: { _id: '$serialNumber', count: { $sum: 1 }, docs: { $push: '$_id' } } },
            { $match: { count: { $gt: 1 } } }
        ]);

        let itemDuplicatesRemoved = 0;
        for (const duplicate of itemDuplicates) {
            const [keep, ...remove] = duplicate.docs;
            if (remove.length > 0) {
                await OrderItem.deleteMany({ _id: { $in: remove } });
                itemDuplicatesRemoved += remove.length;
            }
        }

        res.json({
            message: 'Duplicate serial numbers cleaned up successfully',
            orderDuplicatesRemoved,
            itemDuplicatesRemoved,
            totalDuplicatesFound: orderDuplicates.length + itemDuplicates.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderFactoryStats = async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await Order.findById(id).populate('factory');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        const orderItems = await OrderItem.find({ orderId: order.orderId });
        
        const totalItems = orderItems.length;
        const completedItems = orderItems.filter(item => item.status === 'Completed' || item.status === 'Dispatched').length;
        const dispatchedItems = orderItems.filter(item => item.status === 'Dispatched').length;
        const pendingItems = orderItems.filter(item => item.status === 'Pending' || item.status === 'In Progress').length;
        
        res.json({
            orderId: order.orderId,
            factoryName: order.factory?.name,
            totalItems,
            completedItems,
            dispatchedItems,
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

export const getAllOrderItems = async (req, res) => {
    try {
        const orderItems = await OrderItem.find({})
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
            status: 'Dispatched',
            isTransferredToProduct: { $ne: true }
        })
        .populate('factory')
        .populate('category')
        .populate('model');
        
        if (orderItems.length === 0) {
            return res.status(400).json({ 
                message: 'No dispatched order items found for transfer or items already transferred'
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
                    quantity: 1,
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