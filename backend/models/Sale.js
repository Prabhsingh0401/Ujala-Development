import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dealer'
    },
    distributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Distributor'
    },
  customerName: {
    type: String,
  },
  customerPhone: {
    type: String,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  customerEmail: {
    type: String,
  },
  customerAddress: {
    type: String,
  },
  plumberName: {
    type: String,
  },
  soldAt: {
    type: Date,
    default: Date.now,
  },
  saleDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model('Sale', saleSchema);
