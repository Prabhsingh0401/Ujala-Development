import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Calendar, IndianRupee } from 'lucide-react';

const FilterButton = ({ period, activePeriod, setPeriod, children }) => (
    <motion.button
        onClick={() => setPeriod(period)}
        className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-300 ease-in-out flex items-center
            ${activePeriod === period ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 bg-gray-100 hover:text-green-600 hover:bg-green-50'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        {children}
    </motion.button>
);

const formatYAxis = (tick) => {
    if (tick >= 1000000) {
        return `${tick / 1000000}M`;
    }
    if (tick >= 1000) {
        return `${tick / 1000}K`;
    }
    return tick;
};

export default function TotalRevenueChart({ sales }) {
    const [period, setPeriod] = useState('monthly');
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const calculateRevenue = () => {
            const now = new Date();
            const filteredSales = sales.filter(sale => {
                const saleDate = new Date(sale.soldAt || sale.createdAt);
                if (period === 'daily') {
                    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
                }
                if (period === 'monthly') {
                    return saleDate.getFullYear() === now.getFullYear();
                }
                if (period === 'yearly') {
                    // No filter for yearly, show all years
                    return true;
                }
                return true;
            });

            let data;
            if (period === 'daily') {
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                data = Array.from({ length: daysInMonth }, (_, i) => ({
                    name: `${i + 1}`,
                    revenue: 0
                }));
                filteredSales.forEach(sale => {
                    const saleDate = new Date(sale.soldAt || sale.createdAt);
                    if(sale.product && sale.product.price) {
                        data[saleDate.getDate() - 1].revenue += sale.product.price;
                    }
                });
            } else if (period === 'monthly') {
                data = Array.from({ length: 12 }, (_, i) => ({
                    name: new Date(0, i).toLocaleString('default', { month: 'short' }),
                    revenue: 0
                }));
                filteredSales.forEach(sale => {
                    const saleDate = new Date(sale.soldAt || sale.createdAt);
                     if(sale.product && sale.product.price) {
                        data[saleDate.getMonth()].revenue += sale.product.price;
                    }
                });
            } else { // yearly
                const yearlyData = filteredSales.reduce((acc, sale) => {
                    const saleDate = new Date(sale.soldAt || sale.createdAt);
                    const year = saleDate.getFullYear();
                     if(sale.product && sale.product.price) {
                        if (!acc[year]) {
                            acc[year] = { name: year, revenue: 0 };
                        }
                        acc[year].revenue += sale.product.price;
                    }
                    return acc;
                }, {});
                data = Object.values(yearlyData).sort((a,b) => a.name - b.name);
            }

            setChartData(data);
        };

        if (sales.length > 0) {
            calculateRevenue();
        }
    }, [sales, period]);

    return (
        <div className="p-4 bg-white rounded-xl border border-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                 <div className="flex items-center mb-3 sm:mb-0">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <IndianRupee className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Total Revenue</h2>
                </div>
                <div className="flex space-x-2 mb-3">
                    <FilterButton period="daily" activePeriod={period} setPeriod={setPeriod}>
                        <Calendar className="w-3.5 h-3.5 mr-1.5" /> Daily
                    </FilterButton>
                    <FilterButton period="monthly" activePeriod={period} setPeriod={setPeriod}>
                       <Calendar className="w-3.5 h-3.5 mr-1.5" /> Monthly
                    </FilterButton>
                    <FilterButton period="yearly" activePeriod={period} setPeriod={setPeriod}>
                        <Calendar className="w-3.5 h-3.5 mr-1.5" /> Yearly
                    </FilterButton>
                </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: '1px solid #ccc',
                                backdropFilter: 'blur(5px)',
                                borderRadius: '10px'
                             }}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
             {chartData.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-500">No revenue data for this period.</p>
                </div>
            )}
        </div>
    );
}
