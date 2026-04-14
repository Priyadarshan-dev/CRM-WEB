import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield,
  Bell, 
  Settings, 
  LogOut, 
  ChevronRight,
  ClipboardList,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Admin', 'Manager'] },
    { name: 'Leads', icon: Users, path: '/leads', roles: ['Admin', 'Manager'] },
    { name: 'Managers', icon: Shield, path: '/managers', roles: ['Admin'] },
    { name: 'Executives', icon: Target, path: '/executives', roles: ['Admin'] },
    { name: 'Teams', icon: Target, path: '/teams', roles: ['Manager'] },
    { name: 'Daily Tasks', icon: ClipboardList, path: '/tasks', roles: ['Executive'] },
    { name: 'Notifications', icon: Bell, path: '/notifications', roles: ['Admin', 'Manager', 'Executive'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          LeadCRM
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-3 rounded-xl transition-all
              ${isActive 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${user?.role === item.name ? 'rotate-90' : ''}`} />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-slate-50">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
