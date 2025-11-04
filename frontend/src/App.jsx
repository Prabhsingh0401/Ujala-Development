import './App.css'
import { useContext, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/pages/Dashboard/Dashboard'
import Management from './components/pages/Management/Management'
import FactoryManagement from './components/pages/FactoryManagement/FactoryManagement'
import FactoryOrders from './components/pages/factory/factoryorder';
import FactorySales from './components/pages/factory/FactorySales';
import FactoryDashboard from './components/pages/factory/FactoryDashboard';
import DistributorDashboard from './components/pages/DistributorDashboard';
import CustomerDashboard from './components/pages/CustomerDashboard';
import CustomerLayout from './components/global/CustomerLayout';
import DistributorProducts from './components/pages/DistributorProducts';
import DistributorDealers from './components/pages/DistributorDealers';
import DistributorDealerSales from './components/pages/DistributorDealerSales';
import DistributorCustomerSales from './components/pages/DistributorCustomerSales';
import DealerLayout from './components/global/DealerLayout';
import DealerDashboard from './components/pages/DealerDashboard';
import DealerProducts from './components/pages/DealerProducts';
import DealerSales from './components/pages/DealerSales';
import Orders from './components/pages/Orders/Orders'
import Products from './components/pages/Products/Products'
import ErrorBoundary from './components/global/ErrorBoundary'
import Distributors from './components/pages/Distributors/Distributors'
import Dealers from './components/pages/Dealers/Dealers'
import Sales from './components/pages/Sales/Sales'
import Login from './components/auth/Login'
import Notifications from './components/pages/Notifications'
import AddMembers from './components/pages/AddMembers/index';
import Unauthorized from './components/pages/AddMembers/Unauthorized';
import ProtectedSection from './components/auth/ProtectedSection';
import { SideBar } from './components/sideBar/sideBar'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from './context/AuthContext';
import FactoryLayout from './components/global/FactoryLayout';
import DistributorLayout from './components/global/DistributorLayout';


const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!isAuthenticated || !isAdmin) {
    console.log('Access denied to admin route');
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const App = () => {
  const [totalNotifications, setTotalNotifications] = useState(0);

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
            <Route path="dealer-sales" element={<DistributorDealerSales />} />
            <Route path="customer-sales" element={<DistributorCustomerSales />} />
          </Route>

          <Route 
            path="/dealer" 
            element={
              <DealerProtectedRoute>
                <DealerLayout />
              </DealerProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DealerDashboard />} />
            <Route path="products" element={<DealerProducts />} />
            <Route path="sales" element={<DealerSales />} />
          </Route>

          <Route
            path="/customer"
            element={
              <CustomerProtectedRoute>
                <CustomerLayout />
              </CustomerProtectedRoute>
            }
          >
            <Route path="dashboard" element={<CustomerDashboard />} />
          </Route>

          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout totalNotifications={totalNotifications} />
              </ProtectedRoute>
            } 
          >
            <Route index element={<Dashboard />} />
            <Route path="notifications" element={<Notifications setTotalNotifications={setTotalNotifications} />} />
            <Route path="add-members" element={<AdminProtectedRoute><AddMembers /></AdminProtectedRoute>} />
            <Route path="management" element={<ProtectedSection section="management"><Management /></ProtectedSection>} />
            <Route path="factory-management" element={<ProtectedSection section="factories"><FactoryManagement /></ProtectedSection>} />
            <Route path="orders" element={<ProtectedSection section="orders"><Orders /></ProtectedSection>} />
            <Route path="inventory" element={<ProtectedSection section="products"><Products /></ProtectedSection>} />
            <Route path="sales" element={<ProtectedSection section="sales"><Sales /></ProtectedSection>} />
            <Route path="distributors" element={<ProtectedSection section="distributors"><Distributors /></ProtectedSection>} />
            <Route path="dealers" element={<ProtectedSection section="dealers"><Dealers /></ProtectedSection>} />
            <Route path="unauthorized" element={<Unauthorized />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

const Layout = ({ totalNotifications }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen">
        <SideBar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} hasNotifications={totalNotifications > 0} />
        <div className={`flex-grow overflow-y-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-72' : 'ml-16'}`}>
          <Outlet />
        </div>
      </div>
    </ErrorBoundary>
  );
}



const FactoryProtectedRoute = ({ children }) => {
  const { isFactoryAuthenticated, loading } = useContext(AuthContext);

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
  const { isDistributorAuthenticated, loading } = useContext(AuthContext);

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

const DealerProtectedRoute = ({ children }) => {
  const { isDealerAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!isDealerAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const CustomerProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!isAuthenticated || user?.role !== 'customer') {
    return <Navigate to="/login" replace />;
  }

  return children;
};


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

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

export default App;