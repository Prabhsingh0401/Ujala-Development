import './App.css'
import { useContext, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/pages/Dashboard'
import Management from './components/pages/Management/Management'
import FactoryManagement from './components/pages/FactoryManagement/FactoryManagement'
import FactoryOrders from './components/pages/FactoryOrders';
import FactorySales from './components/pages/FactorySales';
import FactoryDashboard from './components/pages/FactoryDashboard';
import DistributorDashboard from './components/pages/DistributorDashboard';
import DistributorProducts from './components/pages/DistributorProducts';
import DistributorDealers from './components/pages/DistributorDealers';
import Orders from './components/pages/Orders/Orders'
import Products from './components/pages/Products/Products'
import ErrorBoundary from './components/global/ErrorBoundary'
import Distributors from './components/pages/Distributors/Distributors'
import Dealers from './components/pages/Dealers/Dealers'
import Login from './components/auth/Login'
import Notifications from './components/pages/Notifications'
import { SideBar } from './components/sideBar/sideBar'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from './context/AuthContext';
import FactoryLayout from './components/global/FactoryLayout';
import DistributorLayout from './components/global/DistributorLayout';


const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/factory" 
            element={
              <FactoryProtectedRoute>
                <FactoryLayout />
              </FactoryProtectedRoute>
            }
          >
            <Route path="dashboard" element={<FactoryDashboard />} />
            <Route path="orders" element={<FactoryOrders />} />
            <Route path="sales" element={<FactorySales />} />
          </Route>

          <Route 
            path="/distributor" 
            element={
              <DistributorProtectedRoute>
                <DistributorLayout />
              </DistributorProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DistributorDashboard />} />
            <Route path="products" element={<DistributorProducts />} />
            <Route path="dealers" element={<DistributorDealers />} />
          </Route>

          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<Dashboard />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="management" element={<Management />} />
            <Route path="factory-management" element={<FactoryManagement />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="distributors" element={<Distributors />} />
            <Route path="dealers" element={<Dealers />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen">
        <SideBar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-grow overflow-y-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-72' : 'ml-16'}`}>
          <Outlet />
        </div>
      </div>
    </ErrorBoundary>
  );
}



const FactoryProtectedRoute = ({ children }) => {
  const { user, isFactoryAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!isFactoryAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const DistributorProtectedRoute = ({ children }) => {
  const { user, isDistributorAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!isDistributorAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default App