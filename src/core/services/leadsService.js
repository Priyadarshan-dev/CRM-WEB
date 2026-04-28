import api from './api';

export const fetchLeads = async (page = 0, size = 10, executiveId = null, unassignedOnly = false) => {
  const params = { page, size };
  if (executiveId) params.executiveId = executiveId;
  if (unassignedOnly) params.unassignedOnly = true;
  const response = await api.get('/leads', { params });
  return response.data;
};

export const createLead = async (data) => {
  const response = await api.post('/leads', data);
  return response.data;
};

export const updateLead = async (id, data) => {
  const response = await api.put(`/leads/${id}`, data);
  return response.data;
};

export const deleteLead = async (id) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};

export const assignLead = async (id, userId) => {
  // Backend uses @RequestParam executiveId
  const response = await api.patch(`/leads/${id}/assign`, null, { params: { executiveId: userId } });
  return response.data;
};

export const bulkCreateLeads = async (leads) => {
  const response = await api.post('/leads/bulk', leads);
  return response.data;
};

export const bulkAssignLeads = async (leadIds, targetUserId) => {
  const response = await api.patch('/leads/bulk-assign', { leadIds, targetUserId });
  return response.data;
};

export const uploadLeadsFile = async (file, managerId = null, executiveId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (managerId) formData.append('managerId', managerId);
  if (executiveId) formData.append('executiveId', executiveId);
  
  const response = await api.post('/leads/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
