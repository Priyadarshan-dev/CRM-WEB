import api from './api';

export const fetchUsersByRole = async (role, page = 0, size = 10) => {
  const response = await api.get(`/users/role/${role}`, { params: { page, size } });
  return response.data;
};

export const fetchManagersShort = async () => {
  const response = await api.get('/users/managers/short');
  return response.data;
};

export const fetchSquadMembers = async (managerId, page = 0, size = 10) => {
  const response = await api.get(`/users/squad/${managerId}`, { params: { page, size } });
  return response.data;
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

export const fetchMyExecutives = async (page = 0, size = 10) => {
  const response = await api.get('/users/my-executives', { params: { page, size } });
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
