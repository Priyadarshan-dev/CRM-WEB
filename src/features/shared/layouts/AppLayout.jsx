import React from 'react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';

const AppLayout = ({ children }) => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800 uppercase tracking-wider text-sm">
            Portal / {window.location.pathname.substring(1) || 'Home'}
          </h2>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              v1.0.0-beta
            </span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
