import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { performCompleteCleanup } from '../utils/serialNumberCleanup.js';

// Load environment variables
dotenv.config();

async function runCleanup() {
    try {
        await connectDB();

        console.log('Starting cleanup process...');
        const result = await performCompleteCleanup();

        console.log('\n=== CLEANUP COMPLETED ===');
        console.log('Results:', JSON.stringify(result, null, 2));

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        try {
            await mongoose.disconnect();
        } catch (disconnectError) {
            console.error('Error disconnecting:', disconnectError.message);
        }
        process.exit(1);
    }
}

// ✅ Always run when file is executed
runCleanup();

export default runCleanup;
