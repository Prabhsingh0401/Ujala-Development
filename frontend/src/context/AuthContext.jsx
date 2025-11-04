import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshDashboardTrigger, setRefreshDashboardTrigger] = useState(0); // New state for triggering dashboard refresh

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        // Also store token separately for convenience
        if (userData?.token) {
            localStorage.setItem('token', userData.token);
        }
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const triggerDashboardRefresh = () => {
        setRefreshDashboardTrigger(prev => prev + 1);
    }; // Function to trigger refresh

    const isAuthenticated = Boolean(user);
    const isAdmin = isAuthenticated && user.role === 'admin';
    const isFactoryAuthenticated = isAuthenticated && user.role === 'factory';
    const isDistributorAuthenticated = isAuthenticated && user.role === 'distributor';
    const isDealerAuthenticated = isAuthenticated && user.role === 'dealer';

    // Check if user has required privileges (support both `privileges` and `accessControl` keys)
    const _privs = user?.privileges || user?.accessControl || null;
    const hasPrivilege = (section, privilege) => {
        if (!user || !_privs) return false;
        return _privs[section]?.[privilege] || _privs[section]?.full || false;
    };

    const hasAnyPrivilege = (section) => {
        if (!user || !_privs) return false;
        const perms = _privs[section];
        if (!perms) return false;
        return Boolean(perms.full || perms.add || perms.modify || perms.delete);
    };

    const hasFullManagementAccess = () => {
        // Admins always have full management access
        if (isAdmin) return true;
        if (!_privs) return false;
        return _privs.management?.full === true;
    };

    return (
        <AuthContext.Provider value={{ 
            user,
            isAuthenticated,
            isAdmin,
            isFactoryAuthenticated,
            isDistributorAuthenticated,
            isDealerAuthenticated,
            login,
            logout,
            loading,
            refreshDashboardTrigger,
            triggerDashboardRefresh,
            hasPrivilege,
            hasAnyPrivilege,
            hasFullManagementAccess
        }}>
            {children}
        </AuthContext.Provider>
    );
};