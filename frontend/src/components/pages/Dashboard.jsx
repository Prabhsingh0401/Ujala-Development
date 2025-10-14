import { useState, useEffect } from 'react';
import { Building, ShoppingCart, Package, Users, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const [counts, setCounts] = useState({
        factories: 0,
        orders: 0,
        products: 0,
        dealers: 0,
        distributors: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/counts`);
                setCounts(response.data);
            } catch (error) {
                console.error('Error fetching dashboard counts:', error);
            }
            setLoading(false);
        };

        fetchCounts();
    }, []);

    const cardData = [
        { title: 'Total Factories', count: counts.factories, icon: <Building className="w-5 h-5" />, bg: '#7C3AED', path: '/factory-management' },
        { title: 'Total Products', count: counts.models, icon: <Package className="w-5 h-5" />, bg: '#EF4444', path: '/management' },
        { title: 'Total Distributors', count: counts.distributors, icon: <Truck className="w-5 h-5" />, bg: '#F59E0B', path: '/distributors' },
        { title: 'Total Dealers', count: counts.dealers, icon: <Users className="w-5 h-5" />, bg: '#FB923C', path: '/dealers' },
        { title: 'Total SubDealers', count: counts.orders, icon: <ShoppingCart className="w-5 h-5" />, bg: '#0EA5E9', path: '/orders' },
    ];

    return (
        <div className="p-1 bg-white min-h-50 mt-10 mr-5 rounded-xl">
            <div className="p-3 sm:p-6">
                <h1 className="mb-5 font-bold text-lg">Progress Overview</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-1">
                    {cardData.map((card, index) => (
                        <Link to={card.path} key={index}>
                            <div className="rounded-xl shadow-card p-4 sm:p-6 text-white transition-transform hover:scale-102" style={{ background: card.bg }}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
                                            {/* icon uses card.bg as color */}
                                            <span style={{ color: card.bg }}>{card.icon}</span>
                                        </div>
                                        <h3 className="text-sm font-semibold mb-1 text-white/90">{card.title}</h3>
                                        {loading ? (
                                            <div className="animate-pulse bg-white/20 h-8 w-16 rounded-md"></div>
                                        ) : (
                                            <p className="text-2xl sm:text-2xl font-bold">{card.count}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
