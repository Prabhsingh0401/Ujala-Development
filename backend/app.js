// index.js
import express from "express";
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import orderRoutes from './routes/ordersRoutes.js';
import factoryRoutes from './routes/factoryRoutes.js';
import distributorRoutes from './routes/distributorRoutes.js';
import productRoutes from './routes/productRoutes.js';
import dealerRoutes from './routes/dealerRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

import distributorProductRoutes from './routes/distributorProductRoutes.js';
import distributorDealerRoutes from './routes/distributorDealerRoutes.js';
import factoryOrderRoutes from './routes/factoryOrderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import authRoutes from './routes/authRoutes.js';
import distributorRequestRoutes from './routes/distributorRequestRoutes.js'; // Import new distributor request routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ujala.vercel.app',
  'https://fdjp6fx2-5173.inc1.devtunnels.ms',
  'https://ujala-development.vercel.app/'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/factories', factoryRoutes);
app.use('/api/distributors', distributorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/distributor/products', distributorProductRoutes);
app.use('/api/distributor/dealers', distributorDealerRoutes);
app.use('/api/factory/orders', factoryOrderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/distributor-requests', distributorRequestRoutes); // Register new distributor request routes

app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

connectDB();

app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
