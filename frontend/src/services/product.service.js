import api from './api';

export const productService = {
  getProducts: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
};
