import { useState, useEffect, useContext } from 'react';
import { ShoppingCart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

export default function FactoryDashboard() {
    const [stats, setStats] = useState({ orders: 0, sales: 0 });
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const ordersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/factories/${user.factory._id}/orders`);
            const orders = ordersResponse.data.length;
            const sales = ordersResponse.data.filter(order => order.status === 'completed').length;
            
            setStats({ orders, sales });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Factory Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {user?.factory?.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/factory/orders">
                    <div className="rounded-xl shadow-card p-6 text-white transition-transform hover:scale-102" style={{ background: '#10B981' }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
                                    <ShoppingCart className="w-5 h-5" style={{ color: '#10B981' }} />
                                </div>
                                <h3 className="text-sm font-semibold mb-1 text-white/90">Total Orders</h3>
                                {loading ? (
                                    <div className="animate-pulse bg-white/20 h-8 w-16 rounded-md"></div>
                                ) : (
                                    <p className="text-2xl font-bold">{stats.orders}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/factory/sales">
                    <div className="rounded-xl shadow-card p-6 text-white transition-transform hover:scale-102" style={{ background: '#8B5CF6' }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
                                    <TrendingUp className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                                </div>
                                <h3 className="text-sm font-semibold mb-1 text-white/90">Completed Sales</h3>
                                {loading ? (
                                    <div className="animate-pulse bg-white/20 h-8 w-16 rounded-md"></div>
                                ) : (
                                    <p className="text-2xl font-bold">{stats.sales}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}