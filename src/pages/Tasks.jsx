import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Phone, 
  Clock, 
  MessageSquare, 
  CheckCircle2,
  Calendar,
  Loader2
} from 'lucide-react';
import { fetchLeadsMock } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';

const TaskCard = ({ name, time, source }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all hover:shadow-md">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <Phone className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900">{name}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
          <span>•</span>
          <span>{source}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
        <MessageSquare className="w-5 h-5" />
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-primary transition-all shadow-sm">
        <CheckCircle2 className="w-4 h-4" />
        Done
      </button>
    </div>
  </div>
);

const Tasks = () => {
  const { user } = useAuth();
  
  const { data: myLeads, isLoading } = useQuery({
    queryKey: ['leads', 'tasks', user?.id],
    queryFn: () => fetchLeadsMock(user),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-primary to-accent p-8 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Good morning!</h1>
          <p className="mt-2 text-white/80 font-medium">
            You have {myLeads?.length || 0} follow-ups scheduled for today.
          </p>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 text-center">
          <div className="text-sm font-bold opacity-80 uppercase tracking-tighter">Tasks Done</div>
          <div className="text-2xl font-black">0 / {myLeads?.length || 0}</div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Who to call today
          </h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Priority High</span>
        </div>
        <div className="space-y-4">
          {myLeads?.map((lead) => (
            <TaskCard 
              key={lead.id} 
              name={lead.name} 
              time="Immediate" 
              source={lead.source} 
            />
          ))}
          {!myLeads?.length && (
            <div className="p-8 text-center text-slate-400 italic bg-white rounded-2xl border border-dotted border-slate-200">
               No tasks found for today.
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-100/50 p-6 rounded-3xl border border-dashed border-slate-300 text-center py-10">
        <h3 className="text-slate-500 font-medium italic">All caught up for today? Check your pipeline for tomorrow.</h3>
        <button className="mt-4 text-primary font-bold text-sm hover:underline">View Tomorrow's Schedule</button>
      </section>
    </div>
  );
};

export default Tasks;
