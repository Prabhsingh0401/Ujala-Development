import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const isAuthenticated = user && user.role === 'admin';
    const isFactoryAuthenticated = user && user.role === 'factory';
    const isDistributorAuthenticated = user && user.role === 'distributor';

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isFactoryAuthenticated, isDistributorAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};