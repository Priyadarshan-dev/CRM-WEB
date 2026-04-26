import api from './api';

export const fetchLeads = async () => {
  const response = await api.get('/leads');
  // Backend returns Page<T>, we need the content array
  return response.data.content || response.data;
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
