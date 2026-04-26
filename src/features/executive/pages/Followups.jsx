import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PhoneCall, 
  Clock, 
  MessageSquare, 
  CheckCircle2,
  Calendar,
  Loader2,
  Globe,
  User as UserIcon,
  TrendingUp,
  Star
} from 'lucide-react';
import { fetchLeads } from '../../../core/services/leadsService';
import { useAuth } from '../../../core/context/AuthContext';

const getStatusColor = (status) => {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Contacted': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Qualified': return 'bg-green-100 text-green-700 border-green-200';
    case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const FollowupCard = ({ lead }) => {
  const [done, setDone] = React.useState(false);

  return (
    <div className={`bg-white p-5 rounded-2xl border transition-all group hover:shadow-md ${
      done 
        ? 'border-green-200 bg-green-50/50 opacity-70' 
        : 'border-slate-200 hover:border-primary/30'
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 transition-colors ${
            done
              ? 'bg-green-100 text-green-600'
              : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
          }`}>
            {done ? <CheckCircle2 className="w-6 h-6" /> : <PhoneCall className="w-6 h-6" />}
          </div>

          {/* Lead info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-bold ${done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                {lead.name}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${getStatusColor(lead.status)}`}>
                {lead.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {lead.source}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lead.date}
              </span>
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <UserIcon className="w-3 h-3" />
                {lead.email}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDone(!done)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm ${
              done
                ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                : 'bg-slate-900 text-white hover:bg-primary'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {done ? 'Undo' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Followups = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const { data: myLeads, isLoading } = useQuery({
    queryKey: ['leads', 'followups', user?.id],
    queryFn: fetchLeads,
    enabled: !!user,
    refetchInterval: 10000, 
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const totalLeads = myLeads?.length || 0;
  const newLeads = myLeads?.filter(l => l.status === 'New').length || 0;
  const contactedLeads = myLeads?.filter(l => l.status === 'Contacted').length || 0;

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalLeads / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = myLeads?.slice(startIndex, startIndex + itemsPerPage) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary to-accent p-8 rounded-3xl text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Follow-ups Dashboard</h1>
            <p className="mt-2 text-white/80 font-medium">
              You have <span className="font-black text-white">{totalLeads}</span> leads queued for follow-up today.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 text-center min-w-[100px]">
            <div className="text-sm font-bold opacity-80 uppercase tracking-tighter">Follow-ups</div>
            <div className="text-3xl font-black">{totalLeads}</div>
          </div>
        </div>

        {/* Mini stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Total Pending', value: totalLeads, icon: TrendingUp },
            { label: 'New Leads', value: newLeads, icon: Star },
            { label: 'Contacted', value: contactedLeads, icon: PhoneCall },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 border border-white/10 flex items-center gap-3">
              <Icon className="w-4 h-4 text-white/70" />
              <div>
                <div className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{label}</div>
                <div className="text-white text-lg font-black">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-primary" />
            Your Follow-up Queue
          </h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Leads</span>
        </div>

        <div className="space-y-3">
          {paginatedLeads.map((lead) => (
            <FollowupCard key={lead.id} lead={lead} />
          ))}
          {!myLeads?.length && (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneCall className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-slate-600 font-bold">No follow-ups today</h3>
              <p className="text-slate-400 text-sm mt-1">Check back later once new leads are assigned.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                  currentPage === page
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Followups;
