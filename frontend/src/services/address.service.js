import api from './api';

export const addressService = {
  getAll: () => api.get('/api/addresses'),
  add: (data) => api.post('/api/addresses', data),
  update: (id, data) => api.put(`/api/addresses/${id}`, data),
  remove: (id) => api.delete(`/api/addresses/${id}`),
  setDefault: (id) => api.patch(`/api/addresses/${id}/default`),
};
