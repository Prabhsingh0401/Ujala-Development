import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import ReplacementRequest from '../models/ReplacementRequest.js';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Model from '../models/Model.js';

dotenv.config();

const expireWarrantyForPendingRequest = async () => {
    try {
        await connectDB();

        console.log('Searching for a pending replacement request...');

        // 1. Find a pending replacement request
        const request = await ReplacementRequest.findOne({ status: 'Pending' })
            .populate({
                path: 'product',
                populate: {
                    path: 'model',
                },
            });

        if (!request) {
            console.log('No pending replacement requests found.');
            return;
        }

        console.log(`Found request ${request._id} for product serial: ${request.product?.serialNumber}`);

        // 2. Find the sale record for the product
        const sale = await Sale.findOne({ product: request.product._id });

        if (!sale) {
            console.error(`Error: No sale record found for product ID ${request.product._id}`);
            return;
        }

        console.log(`Found sale record with original sale date: ${sale.saleDate.toDateString()}`);

        // 3. Get the warranty duration from the product's model
        const model = request.product?.model;
        if (!model || !model.warranty || model.warranty.length === 0) {
            console.error(`Error: No warranty information found for model ${model?.name}`);
            return;
        }

        // For simplicity, use the first warranty rule found
        const warrantyRule = model.warranty[0];
        const warrantyMonths = warrantyRule.durationType === 'Years' 
            ? warrantyRule.duration * 12 
            : warrantyRule.duration;

        console.log(`Product warranty is ${warrantyRule.duration} ${warrantyRule.durationType} (${warrantyMonths} months).`);

        // 4. Calculate a new sale date to make the warranty expire
        const newSaleDate = new Date();
        // Set the date to be further in the past than the warranty period (e.g., warranty + 1 month)
        newSaleDate.setMonth(newSaleDate.getMonth() - (warrantyMonths + 1));

        console.log(`Updating sale date to: ${newSaleDate.toDateString()}...`);

        // 5. Update the sale record
        sale.saleDate = newSaleDate;
        await sale.save();

        console.log('✅ Successfully updated the sale date.');
        console.log(`The warranty for product ${request.product.serialNumber} should now be inactive.`);

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};

expireWarrantyForPendingRequest();
