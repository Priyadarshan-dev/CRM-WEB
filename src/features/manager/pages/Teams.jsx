import React from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ChevronRight,
  ChevronLeft,
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
  Zap,
  UserCheck
} from 'lucide-react';
import { 
  fetchTeamHierarchy, 
  createManager, 
  createExecutive, 
  fetchManagersShort, 
  fetchUsersByRole,
  fetchMyExecutives
} from '../../../core/services/userService';
import { fetchLeads, assignLead } from '../../../core/services/leadsService';



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

// ─── Executive Picker Panel (full-screen overlay) ───────────────────────────
const ExecutivePickerPanel = ({ lead, executives, onAssign, onClose }) => {
  const [assigningId, setAssigningId] = React.useState(null);
  const [assignedId, setAssignedId] = React.useState(null);

  const handleAssign = async (exec) => {
    setAssigningId(exec.id);
    await onAssign(lead.id, exec.id);
    setAssignedId(exec.id);
    setAssigningId(null);
    // Small delay so user sees success, then close
    setTimeout(() => onClose(exec), 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">

      {/* Top Nav Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onClose(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Assign Leads
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Select an Executive</h2>
            <p className="text-xs text-slate-400">Choose who to assign this lead to</p>
          </div>
        </div>
      </div>

      {/* Lead Detail Card */}
      {/* <div className="px-12 py-8 flex-shrink-0 flex flex-col items-center">
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4 text-center">Assigning This Lead</p>
        <div className="flex items-center justify-between gap-4 bg-white border-2 border-primary/20 rounded-[24px] px-6 py-5 w-full max-w-xl shadow-xl shadow-primary/5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-2xl flex-shrink-0 shadow-md transform -rotate-3 transition-transform hover:rotate-0 hover:scale-105">
              {lead.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-lg">{lead.name}</h3>
              <p className="text-sm text-slate-500 truncate mt-0.5">{lead.email}</p>
            </div>
          </div>
          <span className="px-4 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 shadow-sm rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0">
            {lead.source}
          </span>
        </div>
      </div> */}
      {/* Assigning Lead Section */}
<div className="px-12 py-8 flex-shrink-0 flex flex-col items-center">
  
  {/* Title */}
  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4 text-center">
    Assigning This Lead
  </p>

  {/* Lead Card */}
  <div className="flex items-center justify-between gap-4 bg-white border-2 border-primary/20 rounded-[24px] px-6 py-5 w-full max-w-3xl shadow-xl shadow-primary/5 transition-all hover:shadow-primary/10 hover:-translate-y-1">
    
    {/* LEFT SIDE */}
    <div className="flex items-center gap-4 min-w-0">
      
      {/* Avatar */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-2xl flex-shrink-0 shadow-md transform -rotate-3 transition-transform hover:rotate-0 hover:scale-105">
        {lead.name.charAt(0)}
      </div>

      {/* Lead Info */}
      <div className="min-w-0">
        <h3 className="font-bold text-slate-900 text-lg">
          {lead.name}
        </h3>
        <p className="text-sm text-slate-500 truncate mt-0.5">
          {lead.email}
        </p>
      </div>
    </div>

    {/* RIGHT SIDE */}
    <span className="px-4 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 shadow-sm rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0">
      {lead.source}
    </span>

  </div>
</div>

      {/* Executive List */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            Your Team — {executives.length} Executive{executives.length !== 1 ? 's' : ''}
          </p>

          {executives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-700 font-bold">No executives in your team</h3>
              <p className="text-slate-400 text-sm mt-1">Add executives from the My Team tab first.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {executives.map(exec => {
                const isThisAssigning = assigningId === exec.id;
                const isThisAssigned = assignedId === exec.id;
                return (
                  <div
                    key={exec.id}
                    className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${
                      isThisAssigned
                        ? 'border-green-200 bg-green-50'
                        : 'border-slate-200 hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 transition-colors ${
                        isThisAssigned
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary'
                      }`}>
                        {isThisAssigned
                          ? <CheckCircle2 className="w-5 h-5" />
                          : exec.name.charAt(0)
                        }
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm">{exec.name}</h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{exec.email}</p>
                      </div>
                    </div>

                    {/* Assign button */}
                    <button
                      onClick={() => !assignedId && handleAssign(exec)}
                      disabled={!!assigningId || !!assignedId}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0 ${
                        isThisAssigned
                          ? 'bg-green-500 text-white cursor-default'
                          : 'bg-slate-900 text-white hover:bg-primary shadow-sm disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {isThisAssigning ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Assigning...</>
                      ) : isThisAssigned ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Assigned</>
                      ) : (
                        <><UserCheck className="w-3.5 h-3.5" /> Assign</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Assign Lead Card ────────────────────────────────────────────────────────
const AssignLeadCard = ({ lead, executives, onAssign }) => {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [assignedExec, setAssignedExec] = React.useState(null);

  const handlePickerClose = (exec) => {
    setIsPickerOpen(false);
    if (exec) setAssignedExec(exec);
  };

  // Assigned confirmation row
  if (assignedExec) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">{lead.name}</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">{lead.email}</p>
          </div>
        </div>
        <p className="text-xs text-green-600 font-semibold bg-green-100/60 px-3 py-1.5 rounded-lg border border-green-200/60 flex-shrink-0">
          ✓ Assigned to {assignedExec.name}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Full-screen Executive Picker */}
      {isPickerOpen && (
        <ExecutivePickerPanel
          lead={lead}
          executives={executives}
          onAssign={onAssign}
          onClose={handlePickerClose}
        />
      )}

      {/* Lead row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/20 hover:shadow-sm transition-all group">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-lg flex-shrink-0">
            {lead.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm truncate">{lead.name}</h4>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 hidden sm:inline-block">
                {lead.source}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">{lead.email}</p>
          </div>
        </div>

        <button
          onClick={() => setIsPickerOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-sm flex-shrink-0"
        >
          <UserCheck className="w-4 h-4" />
          Select Executive
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>
    </>
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
  const [newUserRole, setNewUserRole] = React.useState('MANAGER');
  const [selectedManagerId, setSelectedManagerId] = React.useState('direct');

  // Pagination states
  const [currentTeamPage, setCurrentTeamPage] = React.useState(1);
  const [currentAssignPage, setCurrentAssignPage] = React.useState(1);
  const [selectedExecutiveLeads, setSelectedExecutiveLeads] = React.useState(null);
  const itemsPerPage = 10;

  const userRole = user?.role?.toUpperCase();
  const isManager = userRole === 'MANAGER';

  const { data: teamsData, isLoading, refetch } = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      if (isManager) {
        const data = await fetchMyExecutives();
        return [{
          manager: user.name,
          isOwnerTeam: true,
          members: data.content || data
        }];
      }
      return fetchTeamHierarchy();
    },
    enabled: !!user
  });

  // Fetch managers for the dropdown (Admin only)
  const { data: managers } = useQuery({
    queryKey: ['managers-list'],
    queryFn: fetchManagersShort,
    enabled: userRole === 'ADMIN' && isModalOpen,
  });

  // Fetch leads for assignment (Manager only)
  const { data: leadsData } = useQuery({
    queryKey: ['leads'],
    queryFn: () => fetchLeads(0, 100), // Fetch a larger set for assignment picker
    enabled: isManager,
  });

  const allLeads = leadsData?.content || [];

  // My executives for assignment tab
  const myExecutives = React.useMemo(() => {
    if (isManager) return teamsData?.[0]?.members || [];
    return [];
  }, [teamsData, isManager]);

  // Unassigned leads (leads that don't have an executive assigned yet)
  const leadsToAssign = React.useMemo(() => {
    if (!allLeads) return [];
    // A lead is "To Assign" for a manager if it has no executiveId
    return allLeads.filter(lead => !lead.executiveId);
  }, [allLeads]);

  const totalAssignPages = Math.ceil(leadsToAssign.length / itemsPerPage);
  const paginatedLeadsToAssign = React.useMemo(() => {
    const start = (currentAssignPage - 1) * itemsPerPage;
    return leadsToAssign.slice(start, start + itemsPerPage);
  }, [leadsToAssign, currentAssignPage]);

  const assignMutation = useMutation({
    mutationFn: ({ leadId, executiveId }) => assignLead(leadId, executiveId),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['all-leads']);
      queryClient.invalidateQueries(['stats']);
      queryClient.invalidateQueries(['teams']);
    }
  });



  React.useEffect(() => {
    if (user?.role?.toUpperCase() === 'MANAGER') {
      setNewUserRole('EXECUTIVE');
    }
  }, [user]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    
    const userRole = user.role?.toUpperCase();
    const managerId = userRole === 'MANAGER' 
      ? user.id 
      : (newUserRole === 'EXECUTIVE' 
          ? (selectedManagerId === 'direct' ? null : parseInt(selectedManagerId)) 
          : null);
    
    if (userRole === 'MANAGER' || newUserRole === 'EXECUTIVE') {
      const execData = {
        name: newName,
        email: newEmail,
        role: 'EXECUTIVE',
        password: newPassword,
        managerId: managerId
      };
      await createExecutive(execData);
    } else {
      const managerData = {
        name: newName,
        email: newEmail,
        role: 'MANAGER',
        password: newPassword
      };
      await createManager(managerData);
    }

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
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams & Hierarchy</h1>
          <p className="text-slate-500 text-sm mt-1">
            {userRole === 'ADMIN' 
              ? 'Oversee all sales teams and their organizational structure.' 
              : `Manage your sales executives and territory assignments.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Assign Now button — only visible on My Team tab */}
          {isManager && activeTab === 'teams' && (
            <button
              onClick={() => setActiveTab('assign')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all shadow-lg group relative bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
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



          {/* Add Executive button — only visible on My Team tab */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && activeTab === 'teams' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-primary transition-all shadow-lg shadow-black/10 group"
            >
              <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {userRole === 'ADMIN' ? 'Add New User' : 'Add New Executive'}
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
                    {team.isOwnerTeam ? " Direct Team" : `${team.manager}'s Team`}
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
                {team.members.slice((currentTeamPage - 1) * itemsPerPage, currentTeamPage * itemsPerPage).map((member, midx) => (
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
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExecutiveLeads(member);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-primary/10 hover:text-primary transition-all group/badge"
                      >
                        <Target className="w-3 h-3 group-hover/badge:scale-110 transition-transform" />
                        {member.leadsCount || 0}
                      </button>
                    </div>

                    {/* Status Dot + Arrow */}
                    <div className="col-span-1 flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 ring-2 ring-green-100 flex-shrink-0 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for Team Members */}
              {Math.ceil(team.members.length / itemsPerPage) > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center bg-slate-50/50 gap-2">
                  {Array.from({ length: Math.ceil(team.members.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentTeamPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        currentTeamPage === page
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-white text-slate-500 border border-slate-200 hover:border-primary/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
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
                <div className="flex flex-col gap-3">
                  {paginatedLeadsToAssign.map(lead => (
                    <AssignLeadCard
                      key={lead.id}
                      lead={lead}
                      executives={myExecutives}
                      onAssign={(leadId, execId) => assignMutation.mutateAsync({ leadId, executiveId: execId })}
                    />
                  ))}
                </div>

                {/* Pagination for Unassigned Leads */}
                {totalAssignPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    {Array.from({ length: totalAssignPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentAssignPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                          currentAssignPage === page
                            ? 'bg-slate-900 text-white shadow-lg shadow-black/10 scale-110'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
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
                  {userRole === 'ADMIN' ? 'Create New User' : 'Create New Executive'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Fill in the credentials for the new team member.</p>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setNewUserRole(userRole === 'ADMIN' ? 'MANAGER' : 'EXECUTIVE');
                }} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              {userRole === 'ADMIN' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assign Role</label>
                  <div className="flex p-1 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setNewUserRole('MANAGER')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${newUserRole === 'MANAGER' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewUserRole('EXECUTIVE')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${newUserRole === 'EXECUTIVE' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Executive
                    </button>
                  </div>
                </div>
              )}

              {userRole === 'ADMIN' && newUserRole === 'EXECUTIVE' && (
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
      {/* ── Leads Preview Modal ── */}
      {selectedExecutiveLeads && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl p-8 space-y-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                  {selectedExecutiveLeads.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedExecutiveLeads.name}'s Active Leads</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Showing all leads currently assigned to this executive.</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedExecutiveLeads(null)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {allLeads?.filter(l => l.executiveId === selectedExecutiveLeads.id).length > 0 ? (
                <div className="space-y-3">
                  {allLeads?.filter(l => l.executiveId === selectedExecutiveLeads.id).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{lead.name}</p>
                          <p className="text-[10px] text-slate-400">{lead.source}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-500 font-medium">No leads assigned to this executive yet.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setSelectedExecutiveLeads(null)}
                className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-200 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
