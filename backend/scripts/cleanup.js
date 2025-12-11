import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';
import Customer from '../models/Customer.js';
import Dealer from '../models/Dealer.js';
import DealerDeletionRequest from '../models/DealerDeletionRequest.js';
import Distributor from '../models/Distributor.js';
import DistributorDealerProduct from '../models/DistributorDealerProduct.js';
import DistributorRequest from '../models/DistributorRequest.js';
import Factory from '../models/Factory.js';
import Model from '../models/Model.js';
import Order, { OrderItem, FactoryCounter } from '../models/Order.js';
import PasswordResetRequest from '../models/PasswordResetRequest.js';
import Product from '../models/Product.js';
import ReplacementRequest from '../models/ReplacementRequest.js';
import Sale from '../models/Sale.js';
import Technician from '../models/Technician.js';
import User from '../models/User.js';
import UserRole from '../models/UserRole.js';

dotenv.config();

const cleanupData = async () => {
  try {
    await connectDB();

    console.log('Clearing all data except admin user...');
    // await Category.deleteMany({});
    // await Customer.deleteMany({});
    // await Dealer.deleteMany({});
    // await DealerDeletionRequest.deleteMany({});
    // await Distributor.deleteMany({});
    // await DistributorDealerProduct.deleteMany({});
    // await DistributorRequest.deleteMany({});
    // await Factory.deleteMany({});
    // await Model.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await FactoryCounter.deleteMany({});
    // await PasswordResetRequest.deleteMany({});
    await Product.deleteMany({});
    // await ReplacementRequest.deleteMany({});
    await Sale.deleteMany({});
    // await Technician.deleteMany({});
    // await User.deleteMany({ username: { $ne: 'admin' } }); // Delete all users except 'admin'
    // await UserRole.deleteMany({});
    console.log('Data cleared successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error clearing data: ${error}`);
    process.exit(1);
  }
};

cleanupData();