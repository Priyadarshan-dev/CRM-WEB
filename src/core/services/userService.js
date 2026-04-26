import api from './api';

export const fetchUsersByRole = async (role) => {
  const response = await api.get(`/users/role/${role}`);
  return response.data.content || response.data;
};

export const fetchManagersShort = async () => {
  const response = await api.get('/users/managers/short');
  return response.data;
};

export const fetchSquadMembers = async (managerId) => {
  const response = await api.get(`/users/squad/${managerId}`);
  return response.data.content || response.data;
};

export const fetchTeamHierarchy = async () => {
  const response = await api.get('/users/hierarchy');
  return response.data;
};

export const createManager = async (data) => {
  const response = await api.post('/users/manager', data);
  return response.data;
};

export const createExecutive = async (data) => {
  const response = await api.post('/users/executive', data);
  return response.data;
};

export const fetchMyExecutives = async () => {
  const response = await api.get('/users/my-executives');
  return response.data.content || response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
