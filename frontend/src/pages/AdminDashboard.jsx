import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { adminService } from '../services/admin.service';
import { formatPrice, formatDate, getOrderStatusColor } from '../utils/helpers';

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white rounded-xl shadow-card p-5 border-l-4 ${color} flex items-center space-x-4`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getStats(),
      adminService.getOrders({ limit: 5 }),
    ]).then(([sRes, oRes]) => {
      setStats(sRes.data?.data);
      setRecentOrders(oRes.data?.data || []);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Pharmacy overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.total_users} icon="👥" color="border-blue-500" />
        <StatCard label="Products" value={stats?.total_products} icon="💊" color="border-teal-500" />
        <StatCard label="Orders" value={stats?.total_orders} icon="📦" color="border-purple-500" />
        <StatCard label="Pending Orders" value={stats?.pending_orders} icon="⏳" color="border-yellow-500" />
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { to: '/admin/products', label: 'Products', icon: '💊', color: 'bg-teal-50 border-teal-100' },
          { to: '/admin/orders', label: 'Orders', icon: '📦', color: 'bg-purple-50 border-purple-100' },
          { to: '/admin/inventory', label: 'Inventory', icon: '🏭', color: 'bg-blue-50 border-blue-100' },
          { to: '/admin/prescriptions', label: 'Prescriptions', icon: '📋', color: 'bg-orange-50 border-orange-100' },
          { to: '/admin/users', label: 'Users', icon: '👥', color: 'bg-gray-50 border-gray-200' },
        ].map(({ to, label, icon, color }) => (
          <Link key={to} to={to} className={`bg-white rounded-xl border ${color} p-4 hover:shadow-card transition-shadow flex flex-col items-center gap-2 text-center`}>
            <span className="text-2xl">{icon}</span>
            <span className="font-medium text-gray-800 text-sm">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-teal-600 text-sm hover:underline">View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 text-left border-b border-gray-100">
                  <th className="pb-2 font-medium">Order ID</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5">
                      <Link to={`/admin/orders`} className="font-mono text-xs text-gray-500 hover:text-teal-600">
                        {o.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="py-2.5 text-gray-700">{o.users?.full_name || '—'}</td>
                    <td className="py-2.5 font-medium text-gray-900">{formatPrice(o.total_amount)}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-400">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
