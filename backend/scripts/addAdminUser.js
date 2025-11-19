import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const addAdminUser = async () => {
    await connectDB();

    const username = 'admin';
    const password = 'admin';
    const role = 'admin';

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminUser = await User.create({
            username,
            password: hashedPassword,
            role
        });

        console.log(`Admin user '${adminUser.username}' created successfully.`);
        process.exit(0);
    } catch (error) {
        console.error(`Error creating admin user: ${error.message}`);
        process.exit(1);
    }
};

addAdminUser();
