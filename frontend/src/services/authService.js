import api from './api';

export async function loginUser(username, password) {
  const res = await api.post('/api/auth/login', { username, password });
  return res.data;
}

export async function logoutUser() {
  const res = await api.post('/api/auth/logout');
  return res.data;
}

export async function getMe() {
  const res = await api.get('/api/auth/me');
  return res.data;
}
