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
    complaintDescription: {
        type: String,
        required: true,
    },
    mediaUrl: {
        type: String,
    },
    preferredVisitDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Assigned', 'In Progress', 'Replacement Required', 'Completed'],
        default: 'Pending',
    },
    assignedTechnician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    jcNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    // Fields for diagnosis and resolution
    diagnosisNotes: {
        type: String,
    },
    serviceOutcome: {
        type: String,
        enum: ['Repaired', 'Replacement Required'],
    },
    repairedParts: [{
        name: { type: String, required: true },
        cost: { type: Number, required: true },
    }],
    beforeImagePath: {
        type: String,
    },
    afterImagePath: {
        type: String,
    }
}, {
    timestamps: true,
});
replacementRequestSchema.virtual('technician', {
    ref: 'Technician',
    localField: 'assignedTechnician',
    foreignField: 'user',
    justOne: true,
});

const ReplacementRequest = mongoose.model('ReplacementRequest', replacementRequestSchema);

export default ReplacementRequest;
