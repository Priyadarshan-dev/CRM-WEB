import React from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  UserPlus, 
  X, 
  Loader2, 
  Eye, 
  EyeOff,
  ChevronRight,
  Mail
} from 'lucide-react';
import { fetchUsersByRoleMock, createUserMock } from '../../../core/services/mockApi';

const ManagerCard = ({ name, email }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center font-bold text-purple-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{name}</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Team Leader</p>
        </div>
      </div>
      <div className="px-2 py-0.5 rounded text-[10px] font-bold border bg-purple-50 text-purple-600 border-purple-100">
        Active Squad
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Mail className="w-3.5 h-3.5" />
        {email}
      </div>
      <button className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 hover:bg-primary/5 hover:text-primary transition-all group/btn">
        View Squad
        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
      </button>
    </div>
  </div>
);

const Managers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const { data: managers, isLoading } = useQuery({
    queryKey: ['managers'],
    queryFn: () => fetchUsersByRoleMock('Manager'),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (userData) => createUserMock({ ...userData, role: 'Manager', teamId: 'NEW' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['managers']);
      setIsModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
    }
  });

  const handleCreateManager = (e) => {
    e.preventDefault();
    createMutation.mutate({ name: newName, email: newEmail, password: newPassword });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Team Leaders</h1>
          <p className="text-slate-500 text-sm mt-1">Add and oversee managers who lead your sales squads.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-primary transition-all shadow-lg shadow-black/10 group"
        >
          <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Add New Manager</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {managers?.map((manager) => (
          <ManagerCard key={manager.id} {...manager} />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create New Manager</h2>
                <p className="text-xs text-slate-500 mt-1">Set up a new team leader account.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateManager} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Work Email</label>
                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="sarah@crm.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Secret Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-12 text-sm"
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

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {createMutation.isPending ? 'Creating Account...' : 'Confirm Manager Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Managers;
