import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    technicianCode: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    assignedRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReplacementRequest',
    }],
}, { timestamps: true });

const Technician = mongoose.model('Technician', technicianSchema);

export default Technician;
