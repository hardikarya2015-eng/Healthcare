import api from './api';

export const userService = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  getMyAppointments: () => api.get('/api/users/appointments'),
};
