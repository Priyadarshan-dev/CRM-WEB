import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Loader2
} from 'lucide-react';
import { fetchStatsMock } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';

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
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: () => fetchStatsMock(user),
    enabled: !!user,
  });

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
