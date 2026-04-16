import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './core/context/AuthContext';
import { NotificationProvider } from './core/context/NotificationContext';
import { RoleGate } from './core/context/RoleGate';
import AppLayout from './features/shared/layouts/AppLayout';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import ManagerDashboard from './features/manager/pages/ManagerDashboard';
import AdminLeads from './features/admin/pages/AdminLeads';
import ManagerLeads from './features/manager/pages/ManagerLeads';
import Tasks from './features/executive/pages/Tasks';
import Followups from './features/executive/pages/Followups';
import Teams from './features/manager/pages/Teams';
import Users from './features/admin/pages/Users';
import SquadView from './features/admin/pages/SquadView';
import { Eye, EyeOff } from 'lucide-react';
import Notifications from './features/shared/pages/Notifications';

const queryClient = new QueryClient();

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'Admin') return <AdminDashboard />;
  if (user?.role === 'Manager') return <ManagerDashboard />;
  return <Navigate to="/login" />;
};

const RoleBasedLeads = () => {
  const { user } = useAuth();
  if (user?.role === 'Admin') return <AdminLeads />;
  if (user?.role === 'Manager') return <ManagerLeads />;
  return <Navigate to="/login" />;
};

const Home = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'Executive') {
    return <Navigate to="/tasks" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = React.useState(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'Executive') {
        navigate('/tasks', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    // Removed auto-filling for manual entry
    setEmail('');
    setPassword(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">LeadCRM</h1>
          <p className="mt-2 text-slate-500 font-medium text-sm">
            {!selectedRole ? 'Select your role to start' : `Sign in as ${selectedRole}`}
          </p>
        </div>
        
        {!selectedRole ? (
          <div className="mt-8 space-y-4">
            {['Admin', 'Manager', 'Executive'].map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="w-full flex items-center justify-center px-6 py-4 border border-slate-200 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-primary/30 transition-all text-lg shadow-sm group"
              >
                Sign in as {role}
                <div className="w-2 h-2 rounded-full bg-primary ml-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="p-3 text-sm bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50/50"
                placeholder="e.g. admin@crm.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50/50 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-primary transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : `Enter ${selectedRole} Portal`}
            </button>
            
            <button 
              type="button" 
              onClick={() => setSelectedRole(null)}
              className="w-full text-xs font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors"
            >
              Go Back
            </button>
          </form>
        )}

        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium">© 2026 LeadCRM Enterprise. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

const ProtectedWrapper = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <RoleGate allowedRoles={allowedRoles}>
      <AppLayout>{children}</AppLayout>
    </RoleGate>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/dashboard" element={
                <ProtectedWrapper allowedRoles={['Admin', 'Manager']}>
                  <RoleBasedDashboard />
                </ProtectedWrapper>
              } />
              
              <Route path="/leads" element={
                <ProtectedWrapper allowedRoles={['Admin', 'Manager']}>
                  <RoleBasedLeads />
                </ProtectedWrapper>
              } />

              <Route path="/tasks" element={
                <ProtectedWrapper allowedRoles={['Executive']}>
                  <Tasks />
                </ProtectedWrapper>
              } />

              <Route path="/followups" element={
                <ProtectedWrapper allowedRoles={['Executive']}>
                  <Followups />
                </ProtectedWrapper>
              } />

              <Route path="/users" element={
                <ProtectedWrapper allowedRoles={['Admin']}>
                  <Users />
                </ProtectedWrapper>
              } />

              <Route path="/users/squad/:managerId" element={
                <ProtectedWrapper allowedRoles={['Admin']}>
                  <SquadView />
                </ProtectedWrapper>
              } />

              <Route path="/teams" element={
                <ProtectedWrapper allowedRoles={['Manager']}>
                  <Teams />
                </ProtectedWrapper>
              } />

              <Route path="/notifications" element={
                <ProtectedWrapper allowedRoles={['Admin', 'Manager', 'Executive']}>
                  <Notifications />
                </ProtectedWrapper>
              } />

              <Route path="/" element={<Home />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
