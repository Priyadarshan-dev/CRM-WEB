import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  UserPlus,
  Loader2,
  X,
  User as UserIcon,
  Mail,
  Globe,
  Briefcase,
  Phone
} from 'lucide-react';
import { fetchLeadsMock, createLeadMock } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';

const Leads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [leadForm, setLeadForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'New'
  });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', user?.id],
    queryFn: () => fetchLeadsMock(user),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: createLeadMock,
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      setIsModalOpen(false);
      setLeadForm({ name: '', email: '', phone: '', source: 'Website', status: 'New' });
    }
  });

  const filteredLeads = React.useMemo(() => {
    if (!leads) return [];
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-purple-100 text-purple-700';
      case 'Qualified': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCreateLead = (e) => {
    e.preventDefault();
    createMutation.mutate(leadForm);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage your sales pipeline efficiently.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-primary transition-all shadow-lg shadow-primary/10 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Add New Lead</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm font-medium text-slate-600 focus:outline-none bg-transparent cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="text-sm text-slate-400 font-medium px-2">
              {filteredLeads.length} total leads
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">Lead Information</th>
                <th className="px-6 py-5">Phone Number</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Source</th>
                <th className="px-6 py-5">Assigned To</th>
                <th className="px-6 py-5">Date Added</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{lead.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {lead.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(lead.status)} shadow-sm`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      {lead.source}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {lead.assignedTo === 'Unassigned' ? (
                         <button className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all">
                           <UserPlus className="w-3.5 h-3.5" />
                           Assign
                         </button>
                       ) : (
                         <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                           <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                           {lead.assignedTo}
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {lead.date}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-slate-900 font-bold">No leads found</h3>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Add New Lead</h2>
                <p className="text-sm text-slate-500 mt-0.5">Enter lead details to add them to your pipeline.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLead} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="tel"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Lead Source</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={leadForm.source}
                      onChange={(e) => setLeadForm({...leadForm, source: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm bg-white cursor-pointer appearance-none"
                    >
                      <option value="Website">Website</option>
                      <option value="Facebook">Facebook</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Call">Cold Call</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Initial Status</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={leadForm.status}
                      onChange={(e) => setLeadForm({...leadForm, status: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm bg-white cursor-pointer appearance-none"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-[20px] hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Lead...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create New Lead
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
