import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const customerLinks = [
  { to: '/orders',               label: 'My Orders',          icon: '📦' },
  { to: '/profile',              label: 'Profile',            icon: '👤' },
  { to: '/upload-prescription',  label: 'Prescriptions',      icon: '📋' },
];

const adminLinks = [
  { to: '/admin',                label: 'Overview',           icon: '📊' },
  { to: '/admin/products',       label: 'Products',           icon: '💊' },
  { to: '/admin/orders',         label: 'Orders',             icon: '📦' },
  { to: '/admin/inventory',      label: 'Inventory',          icon: '🏭' },
  { to: '/admin/prescriptions',  label: 'Prescriptions',      icon: '📋' },
  { to: '/admin/users',          label: 'Users',              icon: '👥' },
];

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : customerLinks;

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-gray-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-teal-600 capitalize">{user?.role}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
