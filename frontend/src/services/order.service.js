import api from './api';

export const orderService = {
  placeOrder: (data) => api.post('/api/orders', data),
  getMyOrders: (params) => api.get('/api/orders', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  cancel: (id) => api.post(`/api/orders/${id}/cancel`),
};
