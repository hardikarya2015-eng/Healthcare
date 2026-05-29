import api from './api';

export const adminService = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  getOrders: (params) => api.get('/api/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/api/admin/orders/${id}/status`, { status }),
  getPrescriptions: (params) => api.get('/api/admin/prescriptions', { params }),
  getInventory: () => api.get('/api/admin/inventory'),
  updateInventory: (id, quantity) => api.patch(`/api/admin/inventory/${id}`, { quantity }),
  updatePrescriptionStatus: (id, status) => api.patch(`/api/admin/prescriptions/${id}/status`, { status }),
};
