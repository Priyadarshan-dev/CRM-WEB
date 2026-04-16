import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Mail, 
  Loader2, 
  Target, 
  ChevronRight,
  TrendingUp,
  Users
} from 'lucide-react';
import { fetchSquadMembersMock, fetchUserByIdMock } from '../../../core/services/mockApi';

const SquadView = () => {
  const { managerId } = useParams();
  const navigate = useNavigate();

  const { data: manager, isLoading: loadingManager } = useQuery({
    queryKey: ['user', managerId],
    queryFn: () => fetchUserByIdMock(managerId),
  });

  const { data: squad, isLoading: loadingSquad } = useQuery({
    queryKey: ['squad', managerId],
    queryFn: () => fetchSquadMembersMock(managerId),
  });

  if (loadingManager || loadingSquad) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-semibold w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to User Management
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">
                {manager?.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{manager?.name}'s Squad</h1>
                <p className="text-slate-500 font-medium">Managing {squad?.length || 0} Executives</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Squad Email</p>
              <p className="text-sm font-semibold text-slate-700">{manager?.email}</p>
            </div>
            <div className="px-5 py-3 bg-primary/5 border border-primary/20 rounded-2xl">
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Squad Performance</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                <TrendingUp className="w-4 h-4" />
                Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Squad List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Executive Team Members</h2>
        </div>

        <div className="flex flex-col gap-3">
          {squad?.map((exec) => (
            <div key={exec.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {exec.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{exec.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{exec.email}</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex flex-col flex-1 px-4 border-l border-slate-100 min-w-[140px]">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Assigned Leads</p>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {exec.leadsCount || 0} Leads
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-primary hover:text-white transition-all group/btn whitespace-nowrap">
                  View Performance
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}

          {squad?.length === 0 && (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No executives found in this squad.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SquadView;
