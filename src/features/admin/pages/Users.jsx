import React from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon,
  UserPlus, 
  X, 
  Loader2, 
  Eye, 
  EyeOff,
  ChevronRight,
  Mail,
  Shield,
  Target,
  ChevronDown,
  ShieldCheck,
  Star,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  fetchUsersByRole, 
  createManager, 
  createExecutive, 
  fetchManagersShort,
  updateUser,
  deleteUser
} from '../../../core/services/userService';

const UserRow = ({ id, name, email, role, managerName, onManageSquad, onViewExecutiveLeads, onEdit, onDelete }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group flex items-center justify-between gap-4">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg transition-colors ${
        role?.toUpperCase() === 'MANAGER' ? 'bg-purple-100 text-purple-600 group-hover:bg-primary/10 group-hover:text-primary' : 'bg-primary/10 text-primary'
      }`}>
        {name.charAt(0)}
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{name}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
          <Mail className="w-3 h-3" />
          <span className="truncate">{email}</span>
        </div>
      </div>
    </div>

    <div className="hidden md:flex flex-col items-center gap-1 px-4 border-x border-slate-100 min-w-[140px]">
      <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
        role?.toUpperCase() === 'MANAGER' 
          ? 'bg-purple-50 text-purple-600 border-purple-100' 
          : (managerName === 'Direct Report' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100')
      }`}>
        {role?.toUpperCase() === 'MANAGER' ? 'TEAM LEADER' : 'EXECUTIVE'}
      </div>
    </div>

    <div className="hidden sm:flex flex-col flex-1 min-w-[150px]">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
        {role?.toUpperCase() === 'MANAGER' ? 'Assigned' : 'Reporting To'}
      </p>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        {role?.toUpperCase() === 'MANAGER' ? (
          <span className="text-purple-600">Active Squad</span>
        ) : (
          <>
            {managerName === 'Direct Report' && <Star className="w-3 h-3 text-amber-500 fill-current" />}
            <span>{managerName}</span>
          </>
        )}
      </div>
    </div>
    
    <div className="flex items-center gap-3">
      <button 
        onClick={() => role?.toUpperCase() === 'MANAGER' ? onManageSquad(id) : onViewExecutiveLeads(id)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-primary hover:text-white transition-all group/btn whitespace-nowrap"
      >
        {role?.toUpperCase() === 'MANAGER' ? 'Squad' : 'Stats'}
        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
      </button>

      <button 
        onClick={() => onEdit({ id, name, email, role, managerName })}
        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
        title="Edit User"
      >
        <Edit className="w-4 h-4" />
      </button>

      <button 
        onClick={() => onDelete(id)}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        title="Delete User"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const Users = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('MANAGER'); // 'MANAGER' or 'EXECUTIVE'
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Modal State
  const [formData, setFormData] = React.useState({
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'MANAGER',
    managerId: 'direct'
  });
  const [showPassword, setShowPassword] = React.useState(false);

  // Queries
  const { data: managersData, isLoading: loadingManagers } = useQuery({
    queryKey: ['users', 'MANAGER', currentPage],
    queryFn: () => fetchUsersByRole('MANAGER', currentPage - 1, itemsPerPage),
    enabled: !!user && activeTab === 'MANAGER',
  });

  const { data: executivesData, isLoading: loadingExecutives } = useQuery({
    queryKey: ['users', 'EXECUTIVE', currentPage],
    queryFn: () => fetchUsersByRole('EXECUTIVE', currentPage - 1, itemsPerPage),
    enabled: !!user && activeTab === 'EXECUTIVE',
  });

  const { data: managersList } = useQuery({
    queryKey: ['managers-short-list'],
    queryFn: fetchManagersShort,
    enabled: isModalOpen && formData.role === 'EXECUTIVE',
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (userData) => {
      const finalData = { 
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        adminId: user.id
      };

      if (userData.managerId && userData.managerId !== 'direct') {
        finalData.managerId = parseInt(userData.managerId);
      } else {
        finalData.managerId = null;
      }
      
      if (userData.role === 'EXECUTIVE') {
        return createExecutive(finalData);
      } else {
        return createManager(finalData);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['users', variables.role]);
      setIsModalOpen(false);
      resetForm();
      alert('User created successfully!');
    },
    onError: (error) => {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const finalData = { ...data };
      if (finalData.managerId === 'direct') finalData.managerId = null;
      return updateUser(id, finalData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['users', activeTab]);
      setIsModalOpen(false);
      resetForm();
      alert('User updated successfully!');
    },
    onError: (error) => {
      alert('Error updating user: ' + (error.response?.data?.message || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users', activeTab]);
      alert('User deleted successfully!');
    },
    onError: (error) => {
      alert('Error deleting user: ' + (error.response?.data?.message || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      email: '',
      password: '',
      role: activeTab,
      managerId: 'direct'
    });
    setShowPassword(false);
    setIsEditing(false);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate({ id: formData.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setFormData({
      ...user,
      password: '', // Don't show old password
      managerId: user.managerId || 'direct'
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to permanently remove this user? All their data links will be adjusted.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleManageSquad = (managerId) => {
    navigate(`/users/squad/${managerId}`);
  };

  const handleViewExecutiveLeads = (executiveId) => {
    navigate(`/users/executive-leads/${executiveId}`);
  };

  const currentData = activeTab === 'MANAGER' ? managersData : executivesData;
  const displayUsers = currentData?.content || [];
  const totalPages = currentData?.totalPages || 0;
  const isLoading = activeTab === 'MANAGER' ? loadingManagers : loadingExecutives;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all team leaders and sales executives in one place.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-primary transition-all shadow-lg shadow-black/10 group"
        >
          <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Add Users</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'MANAGER', label: 'Managers', icon: Shield },
          { id: 'EXECUTIVE', label: 'Executives', icon: Target }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content - List View */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {displayUsers?.map((u) => (
            <UserRow 
              key={u.id} 
              onManageSquad={handleManageSquad} 
              onViewExecutiveLeads={handleViewExecutiveLeads}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              {...u} 
            />
          ))}
          {displayUsers?.length === 0 && (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No {activeTab}s found.</p>
            </div>
          )}

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
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit User' : 'Add New User'}</h2>
                <p className="text-xs text-slate-500 mt-1">{isEditing ? 'Update team member information.' : 'Create a new account for your team.'}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">User Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {['MANAGER', 'EXECUTIVE'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role })}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all ${
                        formData.role === role 
                          ? 'bg-primary/5 border-primary text-primary' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Reporting To (only for Executive) */}
              {formData.role === 'EXECUTIVE' && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Reporting To</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      className="w-full pl-11 pr-10 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-slate-50/30 text-sm font-medium"
                    >
                      <option value="direct">Direct Report (Super Admin)</option>
                      {managersList?.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Work Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="john@crm.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Secret Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <div className="pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing 
                    ? (updateMutation.isPending ? 'Updating...' : 'Save Changes') 
                    : (createMutation.isPending ? 'Processing...' : 'Create Account')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
