import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// GET /api/customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.aggregate([
      {
        $lookup: {
          from: 'sales',
          let: { cid: '$_id', phone: '$phone' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$customer', '$$cid'] },
                    { $eq: ['$customerPhone', '$$phone'] }
                  ]
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'purchases'
        }
      },
      {
        $addFields: {
          purchaseCount: { $ifNull: [{ $arrayElemAt: ['$purchases.count', 0] }, 0] }
        }
      },
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          address: 1,
          purchaseCount: 1
        }
      }
    ]);

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/customers/:id/purchases
export const getCustomerPurchases = async (req, res) => {
  try {
    const customerId = req.params.id;

    const customer = await Customer.findById(customerId).lean();
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const phone = customer.phone;

    let sales = await Sale.find({
      $or: [
        { customer: new mongoose.Types.ObjectId(customerId) },
        ...(phone ? [{ customerPhone: phone }] : [])
      ]
    })
      .populate({ path: 'product', populate: { path: 'model' } })
      .populate('dealer')
      .populate('distributor')
      .sort({ soldAt: -1 })
      .lean();

    // Enrich with warranty info similar to customer endpoint
    const now = new Date();
    sales = sales.map(sale => {
      try {
        const model = sale.product?.model;
        const seller = sale.distributor || sale.dealer || null;
        let warrantyInfo = null;

        if (model && Array.isArray(model.warranty) && model.warranty.length > 0) {
          const candidate = model.warranty.find(w => seller && w.state === seller.state && w.city === seller.city)
            || model.warranty.find(w => seller && w.state === seller.state)
            || model.warranty[0];

          if (candidate) {
            const months = candidate.durationType === 'Years' ? candidate.duration * 12 : candidate.duration;
            const soldAt = sale.soldAt ? new Date(sale.soldAt) : (sale.createdAt ? new Date(sale.createdAt) : now);
            const expiry = new Date(soldAt);
            expiry.setMonth(expiry.getMonth() + months);
            const inWarranty = expiry >= now;

            warrantyInfo = {
              state: candidate.state,
              city: candidate.city,
              durationType: candidate.durationType,
              duration: candidate.duration,
              durationMonths: months,
              expiryDate: expiry,
              inWarranty
            };
          }
        }

        return { ...sale, warrantyInfo };
      } catch (err) {
        return sale;
      }
    });

    res.json(sales);
  } catch (error) {
    console.error('Error fetching customer purchases:', error);
    res.status(500).json({ message: error.message });
  }
};
