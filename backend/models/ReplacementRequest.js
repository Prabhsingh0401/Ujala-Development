import mongoose from 'mongoose';

const replacementRequestSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Assigned'],
        default: 'Pending',
    },
    assignedTechnician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

replacementRequestSchema.virtual('technician', {
    ref: 'Technician',
    localField: 'assignedTechnician',
    foreignField: 'user',
    justOne: true,
});

const ReplacementRequest = mongoose.model('ReplacementRequest', replacementRequestSchema);

export default ReplacementRequest;
