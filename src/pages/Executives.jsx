import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Target, 
  UserPlus, 
  X, 
  Loader2, 
  Eye, 
  EyeOff,
  ChevronRight,
  Mail,
  ShieldCheck,
  ChevronDown,
  Star
} from 'lucide-react';
import { fetchUsersByRoleMock, createUserMock, fetchManagersShortMock } from '../services/mockApi';

const ExecutiveCard = ({ name, email, managerName }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{name}</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sales Executive</p>
        </div>
      </div>
      <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${managerName === 'Direct Report' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
        {managerName === 'Direct Report' && <Star className="w-2.5 h-2.5 inline mr-1 fill-current" />}
        {managerName}
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Mail className="w-3.5 h-3.5" />
        {email}
      </div>
      <button className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 hover:bg-primary/5 hover:text-primary transition-all group/btn">
        View Performance
        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
      </button>
    </div>
  </div>
);

const Executives = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    managerId: 'direct'
  });
  const [showPassword, setShowPassword] = React.useState(false);

  const { data: executives, isLoading } = useQuery({
    queryKey: ['executives'],
    queryFn: () => fetchUsersByRoleMock('Executive'),
    enabled: !!user,
  });

  const { data: managers } = useQuery({
    queryKey: ['managers-list'],
    queryFn: fetchManagersShortMock,
    enabled: isModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: (userData) => {
      const finalManagerId = userData.managerId === 'direct' ? null : parseInt(userData.managerId);
      return createUserMock({ ...userData, role: 'Executive', managerId: finalManagerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['executives']);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', managerId: 'direct' });
    }
  });

  const handleCreateExecutive = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
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
          <h1 className="text-2xl font-bold text-slate-900">Sales Executives</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor all agents across your sales organization.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-primary transition-all shadow-lg shadow-black/10 group"
        >
          <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Add New Executive</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {executives?.map((exec) => (
          <ExecutiveCard key={exec.id} {...exec} />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create New Executive</h2>
                <p className="text-xs text-slate-500 mt-1">Set up a new sales agent account.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateExecutive} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Reporting To</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full pl-11 pr-10 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-slate-50/30 text-sm font-medium"
                  >
                    <option value="direct">Direct Report (Super Admin)</option>
                    {managers?.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="e.g. Liam Neeson"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Work Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="liam@crm.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Secret Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  {createMutation.isPending ? 'Creating Account...' : 'Confirm Executive Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Executives;
