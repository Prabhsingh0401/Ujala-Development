import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Distributor from './models/Distributor.js';
import User from './models/User.js';

dotenv.config();

const seedDistributors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');

        // Clear existing distributor users only
        await User.deleteMany({ role: 'distributor' });
        console.log('Existing distributor users cleared.');

        // Get existing distributors
        const existingDistributors = await Distributor.find({});
        console.log(`${existingDistributors.length} existing Distributors found.`);

        if (existingDistributors.length === 0) {
            console.log('No existing distributors found. Please create distributors first.');
            process.exit();
        }

        for (const distributor of existingDistributors) {
            const nameParts = distributor.name.split(' ');
            const shortForm = nameParts.map(part => part.charAt(0)).join('').toUpperCase();
            const username = `distributor_${shortForm}`;            const password = 'distributor123'; // Simple password for seeding
            const hashedPassword = await bcrypt.hash(password, 10);

            // Check if user already exists for this distributor
            const userExists = await User.findOne({ username, role: 'distributor', distributor: distributor._id });
            
            if (!userExists) {
                await User.create({
                    username,
                    password: hashedPassword,
                    role: 'distributor',
                    distributor: distributor._id,
                });
                console.log(`User ${username} created for distributor ${distributor.name}`);
            } else {
                console.log(`User ${username} already exists for distributor ${distributor.name}, skipping.`);
            }
        }

        console.log('Distributor user seeding complete!');
        process.exit();
    } catch (error) {
        console.error(`Error seeding distributors: ${error.message}`);
        process.exit(1);
    }
};

seedDistributors();
