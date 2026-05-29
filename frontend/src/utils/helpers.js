import { ORDER_STATUS_STEPS } from '../constants';

export const formatPrice = (amount) =>
  `₹${Number(amount || 0).toFixed(2)}`;

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const getDiscountedPrice = (price, discountPercent) =>
  Math.round(price * (1 - discountPercent / 100) * 100) / 100;

export const getOrderStatusColor = (status) => {
  const map = {
    placed:    'badge-blue',
    confirmed: 'badge-blue',
    packed:    'badge-yellow',
    shipped:   'badge-yellow',
    delivered: 'badge-green',
    cancelled: 'badge-red',
    returned:  'badge-gray',
  };
  return map[status] || 'badge-gray';
};

export const getOrderStatusStep = (status) =>
  ORDER_STATUS_STEPS.indexOf(status);

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const truncate = (str, n = 80) =>
  str && str.length > n ? str.slice(0, n) + '...' : str;

export const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const getEstimatedDelivery = (order) => {
  if (!order?.created_at || order.status === 'cancelled' || order.status === 'delivered') return null;
  const map = {
    placed:    '2–3 hrs',
    confirmed: '1–2 hrs',
    packed:    '30–60 mins',
    shipped:   '10–20 mins',
  };
  return map[order.status] || '2–3 hrs';
};
