import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import connectDB from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const expireLatestPurchases = async () => {
    await connectDB();

    const customerPhone = '9560310450';
    const customer = await Customer.findOne({ phone: customerPhone });

    if (!customer) {
        console.log(`Customer with phone number ${customerPhone} not found.`);
        mongoose.disconnect();
        return;
    }

    const sales = await Sale.find({ customer: customer._id }).sort({ soldAt: -1 }).limit(2);

    if (sales.length < 2) {
        console.log(`Customer has fewer than 2 purchases. Found ${sales.length} purchases.`);
        mongoose.disconnect();
        return;
    }

    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    for (const sale of sales) {
        sale.soldAt = twoYearsAgo;
        await sale.save();
        console.log(`Updated sale with ID ${sale._id} to be out of warranty.`);
    }

    mongoose.disconnect();
};

expireLatestPurchases();
