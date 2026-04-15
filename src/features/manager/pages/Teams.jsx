import React from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Star,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  Zap
} from 'lucide-react';
import { 
  fetchTeamHierarchyMock, 
  createUserMock, 
  fetchManagersShortMock, 
  fetchLeadsMock, 
  fetchUsersByRoleMock, 
  updateLeadAssignmentMock 
} from '../../../core/services/mockApi';

// ─── Team Member Card ───────────────────────────────────────────────────────
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

// ─── Assign Lead Card (used in Assign tab) ──────────────────────────────────
const AssignLeadCard = ({ lead, executives, onAssign }) => {
  const [selectedExec, setSelectedExec] = React.useState('');
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [isAssigned, setIsAssigned] = React.useState(false);

  const handleAssign = async () => {
    if (!selectedExec) return;
    setIsAssigning(true);
    await onAssign(lead.id, selectedExec);
    setIsAssigning(false);
    setIsAssigned(true);
  };

  if (isAssigned) {
    const exec = executives?.find(e => String(e.id) === String(selectedExec));
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg flex-shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-sm truncate">{lead.name}</h4>
          <p className="text-xs text-green-600 font-semibold mt-0.5">
            ✓ Assigned to {exec?.name || 'Executive'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{lead.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-lg flex-shrink-0">
          {lead.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">{lead.name}</h4>
              <p className="text-xs text-slate-500 truncate mt-0.5">{lead.email}</p>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
              {lead.source}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={selectedExec}
                onChange={(e) => setSelectedExec(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 appearance-none bg-slate-50 hover:bg-white transition-all cursor-pointer"
              >
                <option value="" disabled>Select Executive...</option>
                {executives?.map(exec => (
                  <option key={exec.id} value={exec.id}>{exec.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={handleAssign}
              disabled={!selectedExec || isAssigning}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isAssigning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Teams Component ───────────────────────────────────────────────────
const Teams = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Tab state
  const [activeTab, setActiveTab] = React.useState('teams');

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

  // Fetch leads for assignment (Manager only)
  const { data: allLeads } = useQuery({
    queryKey: ['leads', user?.id],
    queryFn: () => fetchLeadsMock(user),
    enabled: !!user && user.role === 'Manager',
  });

  // Fetch executives for assignment dropdown (Manager only)
  const { data: allExecutives } = useQuery({
    queryKey: ['executives'],
    queryFn: () => fetchUsersByRoleMock('Executive'),
    enabled: !!user && user.role === 'Manager',
  });

  // Filter executives belonging to this manager
  const myExecutives = React.useMemo(() => {
    if (!allExecutives || !user) return [];
    return allExecutives.filter(e => e.managerId === user.id);
  }, [allExecutives, user]);

  // Unassigned leads
  const leadsToAssign = React.useMemo(() => {
    if (!allLeads) return [];
    return allLeads.filter(lead => lead.assignedTo === 'Unassigned');
  }, [allLeads]);

  const assignMutation = useMutation({
    mutationFn: ({ leadId, executiveId }) => updateLeadAssignmentMock(leadId, executiveId),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['all-leads']);
      queryClient.invalidateQueries(['stats']);
      queryClient.invalidateQueries(['teams']);
    }
  });

  React.useEffect(() => {
    if (user?.role === 'Manager') {
      setNewUserRole('Executive');
    }
  }, [user]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    
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

  const isManager = user?.role === 'Manager';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams & Hierarchy</h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === 'Admin' 
              ? 'Oversee all sales teams and their organizational structure.' 
              : `Manage your sales executives and territory assignments.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Assign Now button — manager only */}
          {isManager && (
            <button
              onClick={() => setActiveTab('assign')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all shadow-lg group relative ${
                activeTab === 'assign'
                  ? 'bg-primary text-white shadow-primary/30'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Assign Now</span>
              {leadsToAssign.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                  {leadsToAssign.length}
                </span>
              )}
            </button>
          )}

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
      </div>

      {/* ── Tabs (Manager only) ── */}
      {isManager && (
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            id="tab-teams"
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'teams'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            My Team
          </button>
          <button
            id="tab-assign"
            onClick={() => setActiveTab('assign')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all relative ${
              activeTab === 'assign'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Assign Leads
            {leadsToAssign.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black bg-red-500 text-white">
                {leadsToAssign.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TEAMS TAB ─────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'teams' && (
        <div className="space-y-8">
          {teamsData?.map((team, idx) => (
            <div key={idx} className={`overflow-hidden ${team.isOwnerTeam ? 'p-6 bg-primary/5 rounded-[32px] border border-primary/10' : 'bg-white rounded-[28px] border border-slate-200 shadow-sm'}`}>
              {/* Team Header */}
              <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-slate-100">
                <div className={`p-2.5 rounded-xl ${team.isOwnerTeam ? 'bg-primary text-white' : 'bg-gradient-to-br from-purple-500 to-violet-600 text-white'}`}>
                  {team.isOwnerTeam ? <Star className="w-4 h-4 fill-current" /> : <Shield className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${team.isOwnerTeam ? 'text-primary' : 'text-slate-800'}`}>
                    {team.isOwnerTeam ? "Owner's Direct Team" : `${team.manager}'s Team`}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{team.members.length} active member{team.members.length !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
                  {team.members.length} Members
                </span>
              </div>

              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <div className="col-span-5">Executive</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-2 text-center">Active Leads</div>
                <div className="col-span-1 text-center">Status</div>
              </div>

              {/* Executive Rows */}
              <div className="divide-y divide-slate-100">
                {team.members.map((member, midx) => (
                  <div
                    key={midx}
                    className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-primary/[0.03] transition-all group cursor-pointer"
                  >
                    {/* Name + Avatar */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-sm group-hover:from-primary/30 group-hover:to-accent/30 transition-colors flex-shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm truncate">{member.name}</h4>
                        <p className="text-[11px] text-slate-400 md:hidden truncate">{member.email}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-4 hidden md:block">
                      <p className="text-sm text-slate-500 truncate">{member.email}</p>
                    </div>

                    {/* Lead Count */}
                    <div className="col-span-2 flex justify-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Target className="w-3 h-3" />
                        {member.leads}
                      </span>
                    </div>

                    {/* Status Dot + Arrow */}
                    <div className="col-span-1 flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 ring-2 ring-green-100 flex-shrink-0" />
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
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
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── ASSIGN LEADS TAB (Manager only) ───────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'assign' && isManager && (
        <div className="space-y-6">
          {/* Header banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[28px] p-7 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                <ClipboardList className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">Assign Leads to Executives</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  {leadsToAssign.length} lead{leadsToAssign.length !== 1 ? 's' : ''} waiting to be assigned to your team.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-center">
                <div className="text-white text-2xl font-black">{leadsToAssign.length}</div>
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pending</div>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-center">
                <div className="text-white text-2xl font-black">{myExecutives.length}</div>
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Executives</div>
              </div>
            </div>
          </div>

          {/* Executives in team */}
          {myExecutives.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Your Team Members</h3>
              <div className="flex flex-wrap gap-3">
                {myExecutives.map(exec => (
                  <div key={exec.id} className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-xs">
                      {exec.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{exec.name}</p>
                      <p className="text-[10px] text-slate-400">{exec.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leads grid */}
          {leadsToAssign.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">All leads are assigned!</h3>
              <p className="text-slate-500 text-sm mt-2">Great job — your team is fully loaded with leads.</p>
              <button
                onClick={() => setActiveTab('teams')}
                className="mt-6 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary transition-all text-sm"
              >
                View My Team
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800">
                  Unassigned Leads
                  <span className="ml-2 text-xs font-bold text-slate-400">({leadsToAssign.length})</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">Select an executive and click Assign</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {leadsToAssign.map(lead => (
                  <AssignLeadCard
                    key={lead.id}
                    lead={lead}
                    executives={myExecutives}
                    onAssign={(leadId, execId) => assignMutation.mutateAsync({ leadId, executiveId: execId })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Create User Modal ── */}
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
                  autoComplete="new-password"
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
