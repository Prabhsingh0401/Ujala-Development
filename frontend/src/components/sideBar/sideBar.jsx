import { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Building,
  Package,
  Users,
  Truck,
  LayoutDashboard,
  Settings,
  Bell,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import NotificationIcon from '../global/NotificationIcon';

const sidebarItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    color: 'blue',
  },
  {
    title: 'Management',
    path: '/management',
    icon: Settings,
    color: 'indigo',
  },
  {
    title: 'Factories',
    icon: Building,
    color: 'green',
    children: [
      {
        title: 'Factory Management',
        path: '/factory-management',
      },
      {
        title: 'Orders',
        path: '/orders',
      },
    ],
  },
  // {
  //   title: 'Products',
  //   path: '/products',
  //   icon: Package,
  //   color: 'yellow',
  // },
  // {
  //   title: 'Distributors',
  //   path: '/distributors',
  //   icon: Users,
  //   color: 'purple',
  // },
  // {
  //   title: 'Dealers',
  //   path: '/dealers',
  //   icon: Truck,
  //   color: 'red',
  // },
];

const getActiveClasses = (color) => {
  const colorMap = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  };
  return colorMap[color] || 'text-gray-600';
};

const getActiveIconBgClasses = (color) => {
  return 'bg-transparent';
};

const getInactiveIconBgClasses = (color) => {
  return 'bg-transparent';
};

const getIconColorClasses = (color) => {
  const colorMap = {
    blue: 'text-blue-500',
    indigo: 'text-indigo-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    red: 'text-red-500',
    orange: 'text-orange-500',
  };
  return colorMap[color] || 'text-gray-500';
};

export function SideBar({ sidebarOpen, toggleSidebar }) {
  const [crmOpen, setCrmOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!sidebarOpen) {
      setCrmOpen(false);
    }
  }, [sidebarOpen]);

  const toggleCrm = () => {
    if (!sidebarOpen) {
      toggleSidebar();
    }
    setCrmOpen(!crmOpen);
  };

  const isChildActive = (children) => {
    return children.some(child => isActive(child.path));
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out text-white ${
          sidebarOpen ? 'w-68' : 'w-16'
        }`}
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col px-4 pb-4 overflow-y-auto" style={{ background: 'var(--sidebar-bg)' }}>
          {/* Sidebar Header */}
          <div
            className={`flex items-center h-20 border-b border-gray-300/40 ${
              sidebarOpen ? 'justify-between px-2' : 'justify-center'
            }`}
          >
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                {/* <img src="/Ujala_template_logo.png" alt="Ujala" className="w-10 h-10 object-contain" /> */}
                <div>
                  <div className="text-lg font-extrabold">Ujala</div>
                  <div className="text-xs text-white/80 -mt-1">Admin Dashboard</div>
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              type="button"
              className="p-2 text-white rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 "
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Sidebar Items */}
          {sidebarOpen ? (
            <ul className="mt-4 space-y-2 font-bold">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <li key={index}>
                    {item.children ? (
                      <>
                        {/* Collapsible Parent */}
                        <button
                          onClick={toggleCrm}
                          type="button"
                          className={`flex items-center w-full py-2 px-3 rounded-xl group transition-all duration-200 font-bold ${isChildActive(item.children) ? 'bg-white sidebar-pill' : ''}`}
                        >
                          <div className={`p-2 rounded-full transition-colors duration-200 flex-shrink-0 ${isChildActive(item.children) ? 'bg-[var(--primary-purple)]' : 'bg-white/10'}`}>
                            <Icon
                              className={`w-5 h-5 ${isChildActive(item.children) ? 'text-white' : 'text-white/90'}`}
                            />
                          </div>
                          <>
                            <span className={`flex-1 ml-4 text-left font-bold ${isChildActive(item.children) ? 'text-[var(--sidebar-bg)]' : 'text-white/90'}`}>
                              {item.title}
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 ${
                                crmOpen ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </>
                        </button>

                        {/* Children Links */}
                        <ul
                          className={`space-y-2 mt-2 transition-all duration-300 overflow-hidden  ${
                            crmOpen
                              ? 'max-h-40 opacity-100'
                              : 'max-h-0 opacity-0'
                          } pl-7`}
                        >
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              <Link
                                to={child.path}
                                className={`flex items-center w-full py-2 px-3 transition duration-200 rounded-lg ${isActive(child.path) ? 'bg-white sidebar-pill' : ''}`}
                              >
                                {sidebarOpen && (
                                  <>
                                    <span className={`w-2 h-2 ${isActive(child.path) ? 'bg-[var(--primary-purple)]' : 'bg-white/40'} rounded-full mr-3 flex-shrink-0`}></span>
                                    <span className={`${isActive(child.path) ? 'text-[var(--sidebar-bg)]' : 'text-white/90'} font-bold`}>{child.title}</span>
                                  </>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        className={`flex items-center py-2 px-3 rounded-xl group transition-all duration-200  ${isActive(item.path) ? 'bg-white' : ''}`}
                      >
                        <div
                          className={`p-2 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${isActive(item.path) ? 'bg-white' : 'bg-white/10'}`}
                        >
                          {item.showIcon ? (
                            <NotificationIcon />
                          ) : (
                            <Icon
                              className={`w-5 h-5 ${isActive(item.path) ? 'text-[var(--sidebar-bg)]' : 'text-white/90'}`}
                            />
                          )}
                        </div>
                        {sidebarOpen && (
                          <span className={`ml-4 font-bold ${isActive(item.path) ? 'text-[var(--sidebar-bg)]' : 'text-white/90'}`}>{item.title}</span>
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="mt-6 flex flex-col items-center space-y-4">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const active = item.children ? isChildActive(item.children) : isActive(item.path);
                return (
                  <li key={index}>
                    <Link to={item.path} className="block">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${active ? 'bg-white sidebar-pill' : 'bg-white/10'}`}>
                        {item.showIcon ? (
                          <NotificationIcon />
                        ) : (
                          <Icon className={`${active ? 'text-[var(--sidebar-bg)]' : 'text-white/90'} w-5 h-5`} />
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* User Info & Logout */}
          <div className="mt-auto">
            {/* Notifications - Only show for admin */}
            {/* {user?.role === 'admin' && (
              <div className="mb-4">
                {sidebarOpen ? (
                  <Link to="/notifications" className={`flex items-center py-2 px-3 rounded-xl group transition-all duration-200 ${isActive('/notifications') ? 'bg-white sidebar-pill' : ''}`}>
                    <div className={`p-2 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${isActive('/notifications') ? 'bg-[var(--primary-purple)]' : 'bg-white/10'}`}>
                      <div className={isActive('/notifications') ? 'text-white' : 'text-white/90'}>
                        <NotificationIcon />
                      </div>
                    </div>
                    <span className={`ml-4 font-bold ${isActive('/notifications') ? 'text-[var(--sidebar-bg)]' : 'text-white/90'}`}>Notifications</span>
                  </Link>
                ) : (
                  <Link to="/notifications" className="flex items-center justify-center">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${isActive('/notifications') ? 'bg-white sidebar-pill' : 'bg-white/10'}`}>
                      <div className={isActive('/notifications') ? 'text-[var(--sidebar-bg)]' : 'text-white/90'}>
                        <NotificationIcon />
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            )} */}
            
            <div className="mt-4">
              {sidebarOpen ? (
                <button onClick={handleLogout} className="w-full flex items-center py-2 px-3 rounded-xl group transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95">
                  <div className="p-2 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0 bg-white/10">
                    <LogOut className="w-5 h-5 text-white/90" />
                  </div>
                  <span className="ml-4 font-bold text-white/90">Logout</span>
                </button>
              ) : (
                <div className="flex items-center justify-center">
                  <button onClick={handleLogout} className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95">
                    <LogOut className="w-5 h-5 text-white/90" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* </div> */}
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/80 sm:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}
