import api from './api';

export const cartService = {
  getCart: () => api.get('/api/cart'),
  addItem: (product_id, quantity = 1) => api.post('/api/cart/items', { product_id, quantity }),
  updateItem: (productId, quantity) => api.put(`/api/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/api/cart/items/${productId}`),
  clearCart: () => api.delete('/api/cart'),
};
