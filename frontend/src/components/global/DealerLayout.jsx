import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DealerSideBar } from '../sideBar/DealerSideBar';

const DealerLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex h-screen">
            <DealerSideBar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className={`flex-grow overflow-y-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-68' : 'ml-16'}`}>
                <Outlet />
            </div>
        </div>
    );
};

export default DealerLayout;
