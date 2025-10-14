import mongoose from 'mongoose';

const distributorRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    territory: {
        type: String,
        trim: true,
        required: false
    },
    contactPerson: {
        type: String,
        trim: true,
        required: false
    },
    contactPhone: {
        type: String,
        trim: true,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const DistributorRequest = mongoose.model('DistributorRequest', distributorRequestSchema);

export default DistributorRequest;