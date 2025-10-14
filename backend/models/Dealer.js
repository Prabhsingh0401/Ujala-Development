import mongoose from 'mongoose';

const dealerSchema = new mongoose.Schema({
    dealerId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    territory: {
        type: String,
        required: true,
        trim: true
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true
    },
    contactPhone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    distributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Distributor'
    }
}, {
    timestamps: true
});

// Add index for better search performance
dealerSchema.index({ name: 'text', location: 'text', territory: 'text' });

const Dealer = mongoose.model('Dealer', dealerSchema);

export default Dealer;