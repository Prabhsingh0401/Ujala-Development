import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, ChevronDown } from 'lucide-react';

const GOALS = {
    daily: 100,
    weekly: 500,
    monthly: 1000,
    yearly: 12000,
};

const PERIOD_LABELS = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
};

export default function SalesProgress({ sales = [] }) {
    const [period, setPeriod] = useState('monthly');
    const [soldCount, setSoldCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        const now = new Date();
        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.soldAt || sale.createdAt);
            if (period === 'daily') {
                return saleDate.toDateString() === now.toDateString();
            }
            if (period === 'weekly') {
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(endOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return saleDate >= startOfWeek && saleDate <= endOfWeek;
            }
            if (period === 'monthly') {
                return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
            }
            if (period === 'yearly') {
                return saleDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
        setSoldCount(filteredSales.length);
    }, [sales, period]);

    const goal = GOALS[period];
    const progress = goal > 0 ? (soldCount / goal) * 100 : 0;

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        setIsDropdownOpen(false);
    };

    return (
        <div className="p-4 bg-white rounded-xl border border-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div className="flex items-center mb-3 sm:mb-0">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Sales Progress</h2>
                </div>
                
                <div className="relative" ref={dropdownRef}>
                    <motion.button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="px-4 py-2 ml-8 text-sm font-medium rounded-lg bg-purple-600 text-white shadow-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
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
                                {Object.keys(GOALS).map((periodOption) => (
                                    <button
                                        key={periodOption}
                                        onClick={() => handlePeriodChange(periodOption)}
                                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center space-x-2
                                            ${period === periodOption 
                                                ? 'bg-purple-50 text-purple-600 font-medium' 
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

            <div className="text-center">
                <motion.div
                    className="text-4xl font-bold text-gray-800"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={soldCount}
                >
                    {soldCount}
                <p className="text-lg text-center text-gray-400 mt-2">
                        Sold Products
                </p>
                </motion.div>
            </div>

            <div className="mt-5">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-500 mt-1.5">
                    <span>{soldCount}</span>
                    <span>{goal}</span>
                </div>
            </div>
        </div>
    );
}