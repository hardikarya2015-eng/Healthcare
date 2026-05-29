import api from './api';

export const categoryService = {
  getAll: () => api.get('/api/categories'),
  getProductsByCategory: (slug, params) => api.get(`/api/categories/${slug}/products`, { params }),
};
