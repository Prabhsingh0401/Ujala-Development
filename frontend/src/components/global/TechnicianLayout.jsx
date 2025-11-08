import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TechnicianSideBar from '../sideBar/TechnicianSideBar';
import ErrorBoundary from '../global/ErrorBoundary';

export default function TechnicianLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <ErrorBoundary>
            <div className="flex h-full">
                <TechnicianSideBar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <div className={`flex-grow overflow-y-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
                    <Outlet />
                </div>
            </div>
        </ErrorBoundary>
    );
}
