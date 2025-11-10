import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShoppingCart, RefreshCw } from 'lucide-react';

export default function CustomerDashboard() {
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ productsBought: 0, replacementRequests: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const [salesRes, requestsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/sales/customer`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/replacement-requests/customer`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setCounts({
                    productsBought: Array.isArray(salesRes.data) ? salesRes.data.length : 0,
                    replacementRequests: Array.isArray(requestsRes.data) ? requestsRes.data.length : 0
                });
            } catch (err) {
                console.error('Error fetching customer dashboard counts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, []);

    const cards = [
        { title: 'Products Bought', count: counts.productsBought, icon: <ShoppingCart className="w-5 h-5" />, bg: '#0EA5E9', path: '/customer/purchases' },
        { title: 'Replacement Requests', count: counts.replacementRequests, icon: <RefreshCw className="w-5 h-5" />, bg: '#FB923C', path: '/customer/requests' }
    ];

    return (
        <div className="p-4">
            <div className="p-1 bg-white min-h-50 mt-3 rounded-xl">
                <div className="p-3 sm:p-6">
                    <h1 className="mb-5 font-bold text-lg">My Dashboard</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 lg:gap-4">
                        {cards.map((card, idx) => (
                            <Link to={card.path} key={idx}>
                                <div className="rounded-xl shadow-card p-4 sm:p-6 text-white transition-transform hover:scale-102" style={{ background: card.bg }}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
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
        </div>
    );
}
