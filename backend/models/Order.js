import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    model: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Model',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    orderType: {
        type: String,
        required: true,
        enum: ['1_unit', '2_units', '3_units'],
        default: '1_unit'
    },
    unitsPerBox: {
        type: Number,
        required: true,
        default: 1
    },
    totalUnits: {
        type: Number,
        required: true
    },
    factory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Factory',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    isTransferredToProduct: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Individual order item schema for each unit with unique serial number
const orderItemSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    model: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Model',
        required: true
    },
    factory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Factory',
        required: true
    },
    orderType: {
        type: String,
        required: true,
        enum: ['1_unit', '2_units', '3_units'],
        default: '1_unit'
    },
    unitsPerBox: {
        type: Number,
        required: true,
        default: 1
    },
    boxNumber: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    isTransferredToProduct: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Counter schema for factory-specific serial numbers
const factoryCounterSchema = new mongoose.Schema({
    factoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Factory',
        required: true,
        unique: true
    },
    counter: {
        type: Number,
        default: 10000
    }
});

const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);
const FactoryCounter = mongoose.model('FactoryCounter', factoryCounterSchema);

export default Order;
export { OrderItem, FactoryCounter };
