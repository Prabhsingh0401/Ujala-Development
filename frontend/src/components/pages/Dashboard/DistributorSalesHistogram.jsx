import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Users, ShoppingCart } from 'lucide-react';

export default function DistributorSalesHistogram({ assignedProducts }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (assignedProducts.length > 0) {
            const distributorData = assignedProducts.reduce((acc, product) => {
                const distributorName = product.distributor?.name || 'Unknown Distributor';
                if (!acc[distributorName]) {
                    acc[distributorName] = { name: distributorName, assigned: 0, sold: 0 };
                }
                acc[distributorName].assigned += 1;
                if (product.sold) {
                    acc[distributorName].sold += 1;
                }
                return acc;
            }, {});
            setChartData(Object.values(distributorData));
        }
    }, [assignedProducts]);

    return (
        <div className="p-4 bg-white rounded-xl border border-gray-300 h-full">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Distributor Performance</h2>
            </div>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: '1px solid #ccc',
                                backdropFilter: 'blur(5px)',
                                borderRadius: '10px'
                             }}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Bar dataKey="assigned" fill="#2d26bbff" name="Assigned" />
                        <Bar dataKey="sold" fill="#21be5eff" name="Sold" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
