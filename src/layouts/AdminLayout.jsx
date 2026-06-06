import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className={`fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar activePage={location.pathname} />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className="flex flex-col flex-1 min-h-screen lg:ml-64">
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-30">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 mt-16 pt-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
