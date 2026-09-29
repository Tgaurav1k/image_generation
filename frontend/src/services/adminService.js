import api from './api';

export async function createUser(username, password) {
  const res = await api.post('/api/admin/users', { username, password });
  return res.data;
}

export async function listUsers() {
  const res = await api.get('/api/admin/users');
  return res.data;
}

export async function changeUserPassword(userId, newPassword) {
  const res = await api.put(`/api/admin/users/${userId}/password`, { newPassword });
  return res.data;
}

export async function getDashboard() {
  const res = await api.get('/api/admin/dashboard');
  return res.data;
}

export async function createAdmin(username, password) {
  const res = await api.post('/api/admin/admins', { username, password });
  return res.data;
}

export async function listAdmins() {
  const res = await api.get('/api/admin/admins');
  return res.data;
}

export async function deleteAdmin(id) {
  const res = await api.delete(`/api/admin/admins/${id}`);
  return res.data;
}
