import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SalesHistogram() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/monthly-sales`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching monthly sales data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse space-y-4 w-full">
                    <div className="flex space-x-2 justify-between items-end h-64">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="bg-gray-200 w-8 rounded-t" style={{ height: `${Math.random() * 200 + 20}px` }}></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Backend returns [{ _id: <monthNumber>, total: <sum> }].
    // Build a 12-month array with labels and numeric sales to ensure stable rendering.
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthly = Array.from({ length: 12 }).map((_, i) => ({ month: monthNames[i], sales: 0 }));
    data.forEach(item => {
        const monthIndex = Number(item._id) - 1; // months from 1..12 in Mongo
        if (monthIndex >= 0 && monthIndex < 12) {
            monthly[monthIndex].sales = Number(item.total) || 0;
        }
    });

    const normalized = monthly;
    const maxSales = Math.max(...normalized.map(item => item.sales), 0);

    const calculateYAxisMax = (max) => {
        if (max === 0) return 10; // Avoid issues with log(0)
        const power = Math.pow(10, Math.floor(Math.log10(max)));
        const ceil = Math.ceil(max / power);
        return ceil * power;
    };

    const yAxisMax = calculateYAxisMax(maxSales);
    const yAxisSteps = 5;
    const stepValue = yAxisMax / yAxisSteps;

    return (
        <div className="h-80 flex flex-col">
            <div className="flex-1 flex">
                {/* Y-axis */}
                <div className="w-12 flex flex-col justify-between text-xs text-gray-500 pr-2">
                    {Array.from({ length: yAxisSteps + 1 }).map((_, i) => (
                        <div key={i} className="text-right">
                            {Math.round(yAxisMax - (i * stepValue))}
                        </div>
                    ))}
                </div>

                {/* Chart area */}
                <div className="flex-1 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0">
                        {Array.from({ length: yAxisSteps + 1 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-full border-t border-gray-100"
                                style={{ top: `${(i / yAxisSteps) * 100}%` }}
                            />
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="relative h-full flex items-end justify-between px-1">
                        {normalized.map((item, index) => {
                            const height = yAxisMax > 0 ? (item.sales / yAxisMax) * 100 : 0;
                            return (
                                <div key={index} className="flex flex-col items-center group">
                                    <div
                                        className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-500 hover:from-blue-600 hover:to-blue-500 relative"
                                        style={{ height: `${height}%`, minHeight: item.sales > 0 ? '4px' : '0px' }}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            ₹{item.sales}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* X-axis */}
            <div className="flex justify-between text-xs text-gray-500 mt-2 ml-12">
                {normalized.map((item, index) => (
                    <div key={index} className="text-center w-8">
                        {item.month}
                    </div>
                ))}
            </div>
        </div>
    );
}