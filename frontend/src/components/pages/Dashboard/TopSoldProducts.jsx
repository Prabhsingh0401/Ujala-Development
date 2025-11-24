import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';

const PERIOD_LABELS = {
    daily: 'Daily',
    monthly: 'Monthly',
    yearly: 'Yearly'
};

const RankChange = ({ change }) => {
    if (!change || change.from === change.to) {
        return <span className="text-xs text-gray-400">-</span>;
    }

    if (change.from === null) {
        return (
             <motion.div 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <span className="text-xs font-semibold text-blue-500">NEW</span>
             </motion.div>
        );
    }
    
    const isUp = change.to < change.from;

    return (
        <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
        >
            {isUp ? (
                <ArrowUp className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
            ) : (
                <ArrowDown className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" />
            )}
            <span className={`text-xs font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                {`#${change.from + 1}`}&rarr;{`#${change.to + 1}`}
            </span>
        </motion.div>
    );
};

export default function TopSoldProducts({ sales = [] }) {
    const [period, setPeriod] = useState('monthly');
    const [topProducts, setTopProducts] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const prevTopProductsRef = useRef([]);
    const isInitialLoadRef = useRef(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        prevTopProductsRef.current = topProducts.map(p => p._id);
    }, [topProducts]);

    useEffect(() => {
        const calculateTopProducts = () => {
            const now = new Date();
            const filteredSales = sales.filter(sale => {
                const saleDate = new Date(sale.soldAt || sale.createdAt);
                if (period === 'daily') {
                    return saleDate.toDateString() === now.toDateString();
                }
                if (period === 'monthly') {
                    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
                }
                if (period === 'yearly') {
                    return saleDate.getFullYear() === now.getFullYear();
                }
                return true;
            });

            const productCounts = filteredSales.reduce((acc, sale) => {
                if (sale.product && sale.product.model) {
                    const modelId = sale.product.model._id;
                    if (!acc[modelId]) {
                        acc[modelId] = {
                            ...sale.product.model,
                            count: 0
                        };
                    }
                    acc[modelId].count += 1;
                }
                return acc;
            }, {});

            const sortedProducts = Object.values(productCounts)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((product, index) => {
                    let rankChange = null;
                    if (!isInitialLoadRef.current) {
                        const prevIndex = prevTopProductsRef.current.indexOf(product._id);
                        if (prevIndex === -1) {
                            rankChange = { from: null, to: index };
                        } else {
                            rankChange = { from: prevIndex, to: index };
                        }
                    }
                    return { ...product, rankChange };
                });
            
            setTopProducts(sortedProducts);
            if(isInitialLoadRef.current && sales.length > 0) {
                isInitialLoadRef.current = false;
            }
        };

        calculateTopProducts();
    }, [sales, period]);

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        setIsDropdownOpen(false);
    };

    return (
        <div className="p-4 bg-white rounded-xl border border-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                <div className="flex items-center mb-3 sm:mb-0">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Top 5 Selling Models</h2>
                </div>
                
                <div className="relative" ref={dropdownRef}>
                    <motion.button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>{PERIOD_LABELS[period]}</span>
                        <motion.div
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </motion.div>
                    </motion.button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-10"
                            >
                                {Object.keys(PERIOD_LABELS).map((periodOption) => (
                                    <button
                                        key={periodOption}
                                        onClick={() => handlePeriodChange(periodOption)}
                                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center space-x-2
                                            ${period === periodOption 
                                                ? 'bg-blue-50 text-blue-600 font-medium' 
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{PERIOD_LABELS[periodOption]}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank Change</th>
                        </tr>
                    </thead>
                    <tbody className="relative">
                        <AnimatePresence>
                            {topProducts.map((product, index) => (
                                <motion.tr 
                                    key={product._id} 
                                    layout
                                    className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{product.name || 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-600">{product.count}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <RankChange change={product.rankChange} />
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {topProducts.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No sales data for this period.</p>
                    </div>
                )}
            </div>
        </div>
    );
}