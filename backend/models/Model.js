import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  serialNumber: {
    type: Number,
    required: true
  },
  specifications: {
    quantity: {
      type: String,
      default: '1N'
    },
    grossWeight: {
      type: String,
      required: true
    },
    kwHp: {
      type: String,
      required: true
    },
    voltage: {
      type: String,
      required: true
    },
    mrpPrice: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

export default mongoose.model('Model', modelSchema);