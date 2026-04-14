import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ChevronRight,
  Target,
  X,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronDown,
  Star
} from 'lucide-react';
import { fetchTeamHierarchyMock, createUserMock, fetchManagersShortMock } from '../services/mockApi';

const TeamMemberCard = ({ name, email, leads }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-primary/30 transition-all shadow-sm group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="font-semibold text-slate-900">{name}</h4>
        <p className="text-xs text-slate-500">{email}</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="text-right">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Active Leads</p>
        <p className="text-sm font-bold text-slate-900">{leads}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
    </div>
  </div>
);

const Teams = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  
  // New State for Role Selection (Admin only)
  const [newUserRole, setNewUserRole] = React.useState('Manager');
  const [selectedManagerId, setSelectedManagerId] = React.useState('direct');

  const { data: teamsData, isLoading, refetch } = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: () => fetchTeamHierarchyMock(user),
    enabled: !!user,
  });

  // Fetch managers for the dropdown (Admin only)
  const { data: managers } = useQuery({
    queryKey: ['managers-list'],
    queryFn: fetchManagersShortMock,
    enabled: user?.role === 'Admin' && isModalOpen,
  });

  React.useEffect(() => {
    if (user?.role === 'Manager') {
      setNewUserRole('Executive');
    }
  }, [user]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    
    // Logic for managerId: 
    // - Managers assign to themselves.
    // - Admins can assign to a selected manager, or None (null/1).
    const managerId = user.role === 'Manager' 
      ? user.id 
      : (newUserRole === 'Executive' 
          ? (selectedManagerId === 'direct' ? null : parseInt(selectedManagerId)) 
          : null);
    
    await createUserMock({
      name: newName,
      email: newEmail,
      role: newUserRole,
      password: newPassword,
      managerId: managerId,
      teamId: user.role === 'Admin' && newUserRole === 'Manager' ? 'NEW' : user.teamId
    });

    setIsCreating(false);
    setIsModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setSelectedManagerId('direct');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams & Hierarchy</h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === 'Admin' 
              ? 'Oversee all sales teams and their organizational structure.' 
              : `Manage your sales executives and territory assignments.`}
          </p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-primary transition-all shadow-lg shadow-black/10 group"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {user?.role === 'Admin' ? 'Add New User' : 'Add New Executive'}
          </button>
        )}
      </div>

      <div className="space-y-8">
        {teamsData?.map((team, idx) => (
          <div key={idx} className={`space-y-4 ${team.isOwnerTeam ? 'p-6 bg-primary/5 rounded-[32px] border border-primary/10' : ''}`}>
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <div className={`p-2 rounded-lg ${team.isOwnerTeam ? 'bg-primary text-white' : 'bg-purple-100 text-purple-700'}`}>
                {team.isOwnerTeam ? <Star className="w-4 h-4 fill-current" /> : <Shield className="w-4 h-4" />}
              </div>
              <h3 className={`font-bold ${team.isOwnerTeam ? 'text-primary' : 'text-slate-800'}`}>
                {team.isOwnerTeam ? "Owner's Direct Team" : `${team.manager}'s Team`}
              </h3>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">
                {team.members.length} Members
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.members.map((member, midx) => (
                <TeamMemberCard key={midx} {...member} />
              ))}
            </div>
          </div>
        ))}
        
        {!teamsData?.length && (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-500 font-medium">No team structure found.</h3>
          </div>
        )}
      </div>

      {user?.role === 'Manager' && (
        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-slate-900">Quick Assignment</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            You have **3 unassigned leads** in your territory. Assign them to your team members to maintain high response velocity.
          </p>
          <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 shadow-lg shadow-primary/20 transition-all">
            Assign Now
          </button>
        </div>
      )}

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {user.role === 'Admin' ? 'Create New User' : 'Create New Executive'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Fill in the credentials for the new team member.</p>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setNewUserRole(user.role === 'Admin' ? 'Manager' : 'Executive');
                }} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              {user.role === 'Admin' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assign Role</label>
                  <div className="flex p-1 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setNewUserRole('Manager')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${newUserRole === 'Manager' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewUserRole('Executive')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${newUserRole === 'Executive' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Executive
                    </button>
                  </div>
                </div>
              )}

              {user.role === 'Admin' && newUserRole === 'Executive' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assign to Manager</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={selectedManagerId}
                      onChange={(e) => setSelectedManagerId(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-white text-sm"
                    >
                      <option value="direct">None (Direct Report to Admin)</option>
                      {managers?.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-500 ml-1">Leave as 'None' if they report directly to you.</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoComplete="off"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    placeholder="e.g. Robert Pattinson"
                  />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Work Email</label>
                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  autoComplete="none"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="robert@crm.com"
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
                  disabled={isCreating}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 disabled:opacity-50"
                >
                  {isCreating ? 'Creating Account...' : 'Confirm Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
