import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Users, 
  CheckCircle2, 
  ListTodo, 
  Percent,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { fetchStatsMock } from '../../../core/services/mockApi';
import { useAuth } from '../../../core/context/AuthContext';

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

const PerformanceChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.total), 10); // Minimum 10 for scale

  return (
    <div className="h-64 flex items-end justify-between gap-2 px-2 pt-4">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
          <div className="flex items-end gap-1 w-full justify-center h-48">
            {/* Total Leads Bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.total / maxVal) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="w-3 md:w-4 bg-slate-200 rounded-t-lg relative group-hover:bg-slate-300 transition-colors"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                {item.total}
              </div>
            </motion.div>
            
            {/* Converted Leads Bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.converted / maxVal) * 100}%` }}
              transition={{ duration: 1, delay: (i * 0.1) + 0.2 }}
              className="w-3 md:w-4 bg-primary rounded-t-lg relative group-hover:bg-primary/80 transition-colors"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                {item.converted}
              </div>
            </motion.div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate w-full text-center">
            {item.day}
          </span>
        </div>
      ))}
    </div>
  );
};

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
        <StatCard title="Converted Leads" value={stats?.conversions} change={stats?.trends?.conversions} icon={CheckCircle2} color="bg-green-600" />
        <StatCard title="Pending Tasks" value={stats?.pendingTasks} change={stats?.trends?.tasks} icon={ListTodo} color="bg-amber-600" />
        <StatCard title="Conversion Rate" value={stats?.conversionRate} change={stats?.trends?.rate} icon={Percent} color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Performance</h3>
              <p className="text-xs text-slate-400 font-medium">Last 7 days activity</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Converted</span>
              </div>
            </div>
          </div>
          
          <PerformanceChart data={stats?.dailyStats || []} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top Lead Sources</h3>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {stats?.leadSources?.map((source, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">{source.source}</span>
                  <span className="text-sm font-black text-slate-900">{source.percentage}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${source.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full rounded-full ${
                      i === 0 ? 'bg-primary' : 
                      i === 1 ? 'bg-purple-500' : 
                      i === 2 ? 'bg-amber-500' : 
                      'bg-slate-400'
                    }`}
                  />
                </div>
              </div>
            ))}
            {(!stats?.leadSources || stats?.leadSources.length === 0) && (
              <div className="text-center py-10 text-slate-400 italic text-sm">
                No lead source data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
