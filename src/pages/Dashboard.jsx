import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Loader2,
  UserCheck,
  Star,
  X,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { 
  fetchStatsMock, 
  fetchLeadsMock, 
  fetchUsersByRoleMock, 
  updateLeadAssignmentMock 
} from '../services/mockApi';
import { useAuth } from '../context/AuthContext';

const AssignmentLeadCard = ({ lead, executives, onAssign }) => {
  const [isAssigning, setIsAssigning] = React.useState(false);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{lead.name}</h4>
          <p className="text-[10px] text-slate-500 font-medium">{lead.source}</p>
        </div>
      </div>

      <div className="relative group/select">
        <select
          disabled={isAssigning}
          onChange={async (e) => {
            setIsAssigning(true);
            await onAssign(lead.id, e.target.value);
            setIsAssigning(false);
          }}
          className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px] hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer disabled:opacity-50"
          value=""
        >
          <option value="" disabled>Assign to...</option>
          {executives?.map(exec => (
            <option key={exec.id} value={exec.id}>{exec.name}</option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-white transition-colors">
          {isAssigning ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-90`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className={`text-sm font-medium ${change?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAssignQueue, setShowAssignQueue] = React.useState(true);
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: () => fetchStatsMock(user),
    enabled: !!user,
  });

  const { data: allLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ['all-leads'],
    queryFn: () => fetchLeadsMock(user),
    enabled: !!user && user.role === 'Manager',
  });

  const { data: executives } = useQuery({
    queryKey: ['executives'],
    queryFn: () => fetchUsersByRoleMock('Executive'),
    enabled: !!user && user.role === 'Manager',
  });

  const assignMutation = useMutation({
    mutationFn: ({ leadId, executiveId }) => updateLeadAssignmentMock(leadId, executiveId),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-leads']);
      queryClient.invalidateQueries(['stats']);
    }
  });

  const unassignedLeads = allLeads?.filter(l => l.assignedTo === 'Unassigned') || [];
  const myExecutives = executives?.filter(e => e.managerId === user?.id) || [];

  if (statsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
          <p className="text-slate-500 text-sm mt-1">Here is what's happening in your sales territory today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads" value={stats?.totalLeads} change={stats?.trends?.leads} icon={Users} color="bg-blue-600" />
        <StatCard title="Conversions" value={stats?.conversions} change={stats?.trends?.conversions} icon={TrendingUp} color="bg-purple-600" />
        <StatCard title="Closed Won" value={stats?.closedWon} change={stats?.trends?.closed} icon={CheckCircle} color="bg-green-600" />
        <StatCard title="Avg. Response" value={stats?.avgResponse} change={stats?.trends?.response} icon={Clock} color="bg-orange-600" />
      </div>

      {user?.role === 'Manager' && unassignedLeads.length > 0 && showAssignQueue && (
        <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl space-y-6 animate-in slide-in-from-top duration-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Lead Assignment Pending</h3>
                <p className="text-slate-400 text-xs">Distribute these new leads to your squad members.</p>
              </div>
            </div>
            <button onClick={() => setShowAssignQueue(false)} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {unassignedLeads.map(lead => (
              <AssignmentLeadCard 
                key={lead.id} 
                lead={lead} 
                executives={myExecutives} 
                onAssign={(leadId, execId) => assignMutation.mutate({ leadId, executiveId: execId })} 
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Performance</h3>
          <div className="h-64 flex items-center justify-center text-slate-400 italic">
            Chart Visualization Placeholder (using Framer Motion)
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top Lead Sources</h3>
          <div className="space-y-4">
            {['Facebook Ads', 'Google Search', 'LinkedIn', 'Referral'].map((source, i) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-slate-600">{source}</span>
                <div className="flex-1 mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${80 - (i * 15)}%` }}></div>
                </div>
                <span className="text-slate-900 font-medium">{40 - (i * 5)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
