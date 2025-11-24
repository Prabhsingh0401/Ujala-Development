import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const a = (tick) => {
    if (tick >= 1000000) {
        return `${tick / 1000000}M`;
    }
    if (tick >= 1000) {
        return `${tick / 1000}K`;
    }
    return tick;
};

export default function CustomerGrowthChart({ sales }) {
    const [period, setPeriod] = useState('monthly');
    const [chartData, setChartData] = useState([]);
    const [totalCustomers, setTotalCustomers] = useState(0);

    useEffect(() => {
        const calculateCustomerGrowth = () => {
            const now = new Date();
            let filteredSales = sales;

            if (period === 'monthly') {
                filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.soldAt || sale.createdAt);
                    return saleDate.getFullYear() === now.getFullYear();
                });
            }

            const customerData = filteredSales.reduce((acc, sale) => {
                const saleDate = new Date(sale.soldAt || sale.createdAt);
                const customerIdentifier = sale.customerPhone; // Assuming this is unique

                if (!customerIdentifier) return acc;

                const key = period === 'daily' ? saleDate.toISOString().split('T')[0] : 
                            period === 'monthly' ? `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}` :
                            `${saleDate.getFullYear()}`;
                
                if (!acc[key]) {
                    acc[key] = new Set();
                }
                acc[key].add(customerIdentifier);
                return acc;
            }, {});

            const sortedDates = Object.keys(customerData).sort();
            const uniqueCustomers = new Set();
            let cumulativeData = [];

            if (period === 'monthly') {
                const monthlyData = Array.from({ length: 12 }, (_, i) => ({
                    name: new Date(0, i).toLocaleString('default', { month: 'short' }),
                    customers: 0
                }));
                
                sortedDates.forEach(dateKey => {
                    const monthIndex = new Date(dateKey + '-01').getMonth();
                    customerData[dateKey].forEach(c => uniqueCustomers.add(c));
                    monthlyData[monthIndex].customers = uniqueCustomers.size;
                });

                // Fill forward
                for(let i = 1; i < 12; i++) {
                    if(monthlyData[i].customers === 0) {
                        monthlyData[i].customers = monthlyData[i-1].customers;
                    }
                }
                cumulativeData = monthlyData;

            } else { // Yearly and Daily
                 cumulativeData = sortedDates.map(dateKey => {
                    customerData[dateKey].forEach(c => uniqueCustomers.add(c));
                    return {
                        name: dateKey,
                        customers: uniqueCustomers.size,
                    };
                });
            }

            setChartData(cumulativeData);
            setTotalCustomers(uniqueCustomers.size);
        };

        if (sales.length > 0) {
            calculateCustomerGrowth();
        }
    }, [sales, period]);

    return (
        <div className="p-4 bg-white rounded-xl border border-gray-300 h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div className="flex items-center mb-3 sm:mb-0">
                     <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Customer Growth</h2>
                </div>
                 <div className="relative">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="block appearance-none w-full bg-gray-100 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-green-500 text-sm"
                    >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>

            <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Total Unique Customers</p>
                <motion.div
                    className="text-4xl font-bold text-gray-800"
                    key={totalCustomers}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {totalCustomers}
                </motion.div>
            </div>

            <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={a} tick={{ fontSize: 10 }} />
                        <Tooltip
                             contentStyle={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: '1px solid #ccc',
                                backdropFilter: 'blur(5px)',
                                borderRadius: '10px'
                             }}
                        />
                        <Area type="monotone" dataKey="customers" stroke="#82ca9d" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
