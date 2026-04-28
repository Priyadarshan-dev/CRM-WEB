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
  Phone,
  Shield,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2
} from 'lucide-react';
import { fetchLeads, createLead, updateLead, deleteLead, bulkAssignLeads, uploadLeadsFile } from '../../../core/services/leadsService';
import { fetchManagersShort } from '../../../core/services/userService';
import { useAuth } from '../../../core/context/AuthContext';

// ─── Import Leads Modal ──────────────────────────────────────────────────────
const ImportLeadsModal = ({ onClose, onImport, isImporting, managers }) => {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [error, setError] = React.useState('');
  const [selectedManagerId, setSelectedManagerId] = React.useState('');
  const [isDragging, setIsDragging] = React.useState(false);
  const [importDone, setImportDone] = React.useState(false);
  const [importedCount, setImportedCount] = React.useState(0);
  const fileInputRef = React.useRef(null);

  const processFile = (file) => {
    if (!file) return;
    const fileName = file.name.toLowerCase();
    const isCsv = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCsv && !isExcel) {
      setError('Please upload a valid .csv or Excel file.');
      return;
    }
    setError('');
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;
    try {
      const results = await onImport(selectedFile, selectedManagerId);
      const count = results?.length || 0;
      if (count === 0) {
        setError('All leads in this file already exist in the system. No new leads were imported.');
        return;
      }
      setImportedCount(count);
      setImportDone(true);
    } catch (err) {
      setError('Import failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Import Leads</h2>
            <p className="text-xs text-slate-400 mt-0.5">Upload a CSV or Excel file to bulk-import leads into your pipeline.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {/* Success State */}
          {importDone ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Import Successful!</h3>
              <p className="text-slate-500 text-sm mt-2">
                {importedCount} lead{importedCount !== 1 ? 's' : ''} have been added to the pipeline.
              </p>
              <button
                onClick={onClose}
                className="mt-8 px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary transition-all text-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Drop Zone */}
              {!selectedFile && (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all select-none ${
                      isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                      isDragging ? 'bg-primary/10' : 'bg-slate-100'
                    }`}>
                      <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-primary' : 'text-slate-400'}`} />
                    </div>
                    <h3 className="font-bold text-slate-700 text-base">
                      {isDragging ? 'Release to upload' : 'Drop your CSV or Excel file here'}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      or <span className="text-primary font-semibold">click to browse</span>
                    </p>
                    <p className="text-xs text-slate-300 mt-3">Supports .csv, .xlsx, and .xls</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      className="hidden"
                      onChange={(e) => processFile(e.target.files[0])}
                    />
                  </div>

                  {/* Column hints */}
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Expected Columns</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { col: 'Name', req: true },
                        { col: 'Email', req: true },
                        { col: 'Phone', req: false },
                        { col: 'Source', req: false },
                        { col: 'Status', req: false },
                      ].map(({ col, req }) => (
                        <span key={col} className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                          req
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {col}{req && <span className="text-red-400 ml-0.5">*</span>}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3">Columns marked <span className="text-red-400 font-bold">*</span> are required. Works for both CSV and Excel.</p>
                  </div>

                  {/* Assign to Manager Dropdown */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assign all to Manager</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={selectedManagerId}
                        onChange={(e) => setSelectedManagerId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm bg-white cursor-pointer appearance-none"
                      >
                        <option value="">None (Keep Unassigned)</option>
                        {managers?.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 font-medium flex-1">{error}</p>
                  <button onClick={() => { setError(''); setSelectedFile(null); }} className="text-red-300 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Selected File Status */}
              {selectedFile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-primary/5 rounded-2xl border border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB — Ready to import</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedFile(null); setError(''); }}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-bold transition-colors"
                    >
                      <X className="w-4 h-4" /> Remove
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 items-start">
                    <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      The backend will now process your file. It will automatically detect columns like <b>Name</b>, <b>Email</b>, and <b>Phone</b>. Make sure your file has a header row.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!importDone && (
          <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between gap-4 flex-shrink-0 bg-slate-50/50 rounded-b-[32px]">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedFile || isImporting}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              {isImporting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><Upload className="w-4 h-4" /> Start Upload</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Leads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [assignmentFilter, setAssignmentFilter] = React.useState('Unassigned'); // Default to Unassigned as requested
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  
  // Selection State
  const [selectedLeads, setSelectedLeads] = React.useState([]);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = React.useState(false);
  const [bulkAssignManagerId, setBulkAssignManagerId] = React.useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [leadForm, setLeadForm] = React.useState({
    source: 'Website',
    status: 'New',
    managerId: ''
  });

  // Fetch managers for the dropdown
  const { data: managers } = useQuery({
    queryKey: ['managers-list-short'],
    queryFn: fetchManagersShort,
  });

  // Menu State
  const [activeMenuLeadId, setActiveMenuLeadId] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuLeadId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', currentPage, assignmentFilter],
    queryFn: () => fetchLeads(currentPage - 1, itemsPerPage, null, assignmentFilter === 'Unassigned'),
  });

  const leads = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      setIsModalOpen(false);
      setIsEditing(false);
      setLeadForm({ name: '', email: '', phone: '', source: 'Website', status: 'New', managerId: '' });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Failed to create lead.';
      alert(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      setIsModalOpen(false);
      setIsEditing(false);
      setLeadForm({ name: '', email: '', phone: '', source: 'Website', status: 'New', managerId: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      setActiveMenuLeadId(null);
    }
  });

  const bulkImportMutation = useMutation({
    mutationFn: ({ file, managerId }) => uploadLeadsFile(file, managerId),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
    }
  });

  const bulkAssignMutation = useMutation({
    mutationFn: ({ leadIds, targetUserId }) => bulkAssignLeads(leadIds, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      setSelectedLeads([]);
      setIsBulkAssignModalOpen(false);
      setBulkAssignManagerId('');
    }
  });

  const filteredLeads = React.useMemo(() => {
    if (!leads) return [];
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      
      const isUnassigned = !lead.assignedToName || lead.assignedToName === 'Unassigned' || (!lead.managerId && !lead.executiveId);
      const matchesAssignment = assignmentFilter === 'All' || (assignmentFilter === 'Unassigned' && isUnassigned);
      
      return matchesSearch && matchesStatus && matchesAssignment;
    });
  }, [leads, searchQuery, statusFilter, assignmentFilter]);

  const paginatedLeads = filteredLeads;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    if (isEditing && leadForm.id) {
      updateMutation.mutate({ id: leadForm.id, data: leadForm });
    } else {
      createMutation.mutate(leadForm);
    }
  };

  const handleEditClick = (lead) => {
    setLeadForm(lead);
    setIsEditing(true);
    setIsModalOpen(true);
    setActiveMenuLeadId(null);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteMutation.mutate(id);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setLeadForm({ name: '', email: '', phone: '', source: 'Website', status: 'New', managerId: '' });
    setIsModalOpen(true);
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
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
          {[
            { id: 'All', label: 'All Leads' },
            { id: 'Unassigned', label: 'Unassigned' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setAssignmentFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                assignmentFilter === tab.id 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all shadow-sm group"
          >
            <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Upload File</span>
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-primary transition-all shadow-lg shadow-primary/10 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeads.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-inner animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{selectedLeads.length} leads selected</p>
              <p className="text-xs text-slate-500">Choose an action for the selected leads</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLeads([])}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsBulkAssignModalOpen(true)}
              className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:border-primary/40 hover:text-primary transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Assign to Manager
            </button>
          </div>
        </div>
      )}

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
              {totalElements} total leads
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedLeads.length > 0 && selectedLeads.length === paginatedLeads.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads(paginatedLeads.map(l => l.id));
                      } else {
                        setSelectedLeads([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </th>
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
              {paginatedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads([...selectedLeads, lead.id]);
                        } else {
                          setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                  </td>
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
                       {(!lead.assignedToName || lead.assignedToName === 'Unassigned') ? (
                         <p className="flex items-center gap-1.5 px-3 py-1 bg-gray/10 text-primary rounded-lg text-xs font-bold transition-all">

                          Unassign
                        </p>
                       ) : (
                         <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                           <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                           {lead.assignedToName}
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {lead.date}
                  </td>
                  <td className="px-6 py-4 text-center relative">
                    <button 
                      onClick={() => setActiveMenuLeadId(activeMenuLeadId === lead.id ? null : lead.id)}
                      className={`p-2 rounded-xl transition-all ${activeMenuLeadId === lead.id ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-400 hover:bg-white hover:shadow-md hover:text-slate-600'}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuLeadId === lead.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in duration-200 origin-right"
                      >
                        <button
                          onClick={() => handleEditClick(lead)}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-primary/5 hover:text-primary flex items-center gap-2"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit Lead
                        </button>
                        <button
                          onClick={() => handleDeleteClick(lead.id)}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-center bg-slate-50/30 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                  currentPage === page
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

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                  {isEditing ? 'Edit Lead Details' : 'Add New Lead'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {isEditing ? 'Modify the information for this lead.' : 'Enter lead details to add them to your pipeline.'}
                </p>
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

              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assign to Manager</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={leadForm.managerId || ''}
                      onChange={(e) => setLeadForm({...leadForm, managerId: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm bg-white cursor-pointer appearance-none"
                    >
                      <option value="">None (Unassigned)</option>
                      {managers?.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
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
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isEditing ? 'Saving Changes...' : 'Creating Lead...'}
                    </>
                  ) : (
                    <>
                      {isEditing ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {isEditing ? 'Save Changes' : 'Create New Lead'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Import Leads Modal */}
      {isImportModalOpen && (
        <ImportLeadsModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={(file, managerId) => bulkImportMutation.mutateAsync({ file, managerId })}
          isImporting={bulkImportMutation.isPending}
          managers={managers}
        />
      )}

      {/* Bulk Assign Modal */}
      {isBulkAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Assign Leads</h2>
                <p className="text-sm text-slate-500 mt-0.5">Assign {selectedLeads.length} selected leads to a manager.</p>
              </div>
              <button 
                onClick={() => setIsBulkAssignModalOpen(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select Manager</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={bulkAssignManagerId}
                    onChange={(e) => setBulkAssignManagerId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm bg-white cursor-pointer appearance-none"
                  >
                    <option value="" disabled>Select a manager...</option>
                    {managers?.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-[20px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (bulkAssignManagerId) {
                    bulkAssignMutation.mutate({ leadIds: selectedLeads, targetUserId: bulkAssignManagerId });
                  }
                }}
                disabled={!bulkAssignManagerId || bulkAssignMutation.isPending}
                className="flex-1 bg-slate-900 text-white text-sm font-bold py-3 rounded-[20px] hover:bg-primary transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bulkAssignMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;

