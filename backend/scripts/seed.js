
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Customer.deleteMany({});
    await Dealer.deleteMany({});
    await DealerDeletionRequest.deleteMany({});
    await Distributor.deleteMany({});
    await DistributorDealerProduct.deleteMany({});
    await DistributorRequest.deleteMany({});
    await Factory.deleteMany({});
    await Model.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await FactoryCounter.deleteMany({});
    await PasswordResetRequest.deleteMany({});
    await Product.deleteMany({});
    await ReplacementRequest.deleteMany({});
    await Sale.deleteMany({});
    await Technician.deleteMany({});
    await User.deleteMany({ username: { $ne: 'admin' } });
    await UserRole.deleteMany({});
    console.log('Data cleared.');

    // --- CREATE USERS ---
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
        adminUser = await User.create({
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
        });
        console.log('Admin user created.');
    } else {
        console.log('Admin user already exists.');
    }

    const factoryUser = await User.create({
        username: 'factoryuser',
        password: hashedPassword,
        role: 'factory',
        factory: (await Factory.create({ name: 'Main Factory', code: 'F001', location: 'Factory Location', contactPerson: 'Factory Manager', contactPhone: '1234567890', gstNumber: 'GST123', address: 'Factory Address' }))._id
    });

    const distributorUser = await User.create({
        username: 'distributoruser',
        password: hashedPassword,
        role: 'distributor',
        distributor: (await Distributor.create({
            distributorId: 'DIST001',
            name: 'Main Distributor',
            state: 'State',
            city: 'City',
            gstNumber: 'GSTDIST123',
            email: 'distributor@example.com',
            username: 'distributoruser',
            password: 'password123'
        }))._id
    });

    const dealerUser = await User.create({
        username: 'dealeruser',
        password: hashedPassword,
        role: 'dealer',
        dealer: (await Dealer.create({
            dealerId: 'DEAL001',
            name: 'Main Dealer',
            address: 'Dealer Address',
            state: 'State',
            city: 'City',
            contactPerson: 'Dealer Person',
            contactPhone: '0987654321',
            email: 'dealer@example.com',
            username: 'dealeruser',
            password: 'password123',
            distributor: distributorUser.distributor
        }))._id
    });

    const technicianUser = await User.create({
        username: 'technicianuser',
        password: hashedPassword,
        role: 'technician',
    });
    console.log('Users created.');


    // --- CREATE CATEGORIES ---
    console.log('Creating categories...');
    const category1 = await Category.create({ name: 'Pumps' });
    const category2 = await Category.create({ name: 'Motors' });
    console.log('Categories created.');

    // --- CREATE MODELS ---
    console.log('Creating models...');
    const model1 = await Model.create({
        name: 'Water Pump 1HP',
        code: 'WP1000',
        category: category1._id,
        serialNumber: 1001,
        specifications: {
            grossWeight: '10kg',
            kwHp: '1HP',
            voltage: '220V',
            mrpPrice: 5000
        },
        warranty: [{ state: 'State', city: 'City', durationType: 'Years', duration: 2 }]
    });
    console.log('Models created.');

    // --- CREATE FACTORIES ---
    console.log('Creating factories...');
    const factory1 = await Factory.findOne({ name: 'Main Factory' });
    console.log('Factories found.');


    // --- CREATE ORDERS ---
    console.log('Creating orders...');
    const order1 = await Order.create({
        orderId: 'ORD001',
        serialNumber: 'SN001',
        month: 11,
        year: 2025,
        category: category1._id,
        model: model1._id,
        quantity: 10,
        orderType: '1_unit',
        unitsPerBox: 1,
        totalUnits: 10,
        factory: factory1._id,
        status: 'Completed'
    });
    console.log('Orders created.');

    // --- CREATE PRODUCTS ---
    console.log('Creating products...');
    const product1 = await Product.create({
        productId: 'PROD001',
        productName: 'Water Pump 1HP',
        serialNumber: 'SN001-1',
        month: 11,
        year: 2025,
        category: category1._id,
        model: model1._id,
        quantity: 1,
        factory: factory1._id,
        distributor: distributorUser.distributor,
        orderId: order1.orderId,
        price: 5000
    });
    console.log('Products created.');

    // --- CREATE CUSTOMERS ---
    console.log('Creating customers...');
    const customer1 = await Customer.create({
        name: 'Test Customer',
        phone: '1122334455',
        email: 'customer@test.com',
        address: 'Customer Address',
        password: 'password123'
    });
    console.log('Customers created.');

    // --- CREATE SALES ---
    console.log('Creating sales...');
    const sale1 = await Sale.create({
        product: product1._id,
        dealer: dealerUser.dealer,
        distributor: distributorUser.distributor,
        customerName: customer1.name,
        customerPhone: customer1.phone,
        customer: customer1._id
    });
    console.log('Sales created.');

    // --- CREATE TECHNICIANS ---
    console.log('Creating technicians...');
    const technician1 = await Technician.create({
        user: technicianUser._id,
        name: 'Test Technician',
        phone: '5544332211',
        address: 'Technician Address',
        state: 'State',
        city: 'City'
    });
    console.log('Technicians created.');

    // --- CREATE REPLACEMENT REQUESTS ---
    console.log('Creating replacement requests...');
    const replacementRequest1 = await ReplacementRequest.create({
        product: product1._id,
        customer: customer1._id,
        reason: 'Not working',
        status: 'Assigned',
        assignedTechnician: technicianUser._id
    });
    console.log('Replacement requests created.');


    console.log('Seed data created successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding data: ${error}`);
    process.exit(1);
  }
};

seedData();
