export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PLACED:    'placed',
  CONFIRMED: 'confirmed',
  PACKED:    'packed',
  SHIPPED:   'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED:  'returned',
};

export const ORDER_STATUS_STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];

export const PAYMENT_METHODS = [
  { value: 'cod',    label: 'Cash on Delivery', icon: '💵', sub: 'Pay when your order arrives' },
  { value: 'online', label: 'Online Payment',    icon: '💳', sub: 'UPI, Cards, Net Banking' },
];

export const SORT_OPTIONS = [
  { value: 'name',       label: 'Name A–Z' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount',   label: 'Best Discount' },
];

export const CATEGORIES = [
  { name: 'Medicines',            slug: 'medicines',         icon: '💊' },
  { name: 'Vitamins & Supplements', slug: 'vitamins',        icon: '🍊' },
  { name: 'Personal Care',        slug: 'personal-care',     icon: '🧴' },
  { name: 'Baby & Mom',           slug: 'baby-mom',          icon: '👶' },
  { name: 'Devices & Monitors',   slug: 'devices',           icon: '🩺' },
  { name: 'Ayurveda',             slug: 'ayurveda',          icon: '🌿' },
  { name: 'Homeopathy',           slug: 'homeopathy',        icon: '⚗️' },
  { name: 'Covid Essentials',     slug: 'covid-essentials',  icon: '😷' },
];

export const ADDRESS_LABELS = ['Home', 'Work', 'Other'];

export const FREE_DELIVERY_THRESHOLD = 499;
export const DELIVERY_CHARGE = 49;
