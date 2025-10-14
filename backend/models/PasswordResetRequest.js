import mongoose from 'mongoose';

const passwordResetRequestSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['factory', 'distributor'],
        required: true
    },
    factory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Factory',
        required: function() {
            return this.role === 'factory';
        }
    },
    distributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Distributor',
        required: function() {
            return this.role === 'distributor';
        }
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

export default mongoose.model('PasswordResetRequest', passwordResetRequestSchema);