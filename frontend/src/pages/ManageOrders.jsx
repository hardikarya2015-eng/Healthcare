import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { adminService } from '../services/admin.service';
import { formatPrice, formatDate, getOrderStatusColor } from '../utils/helpers';

const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    adminService.getOrders({ status: filter, limit: 50 })
      .then((r) => setOrders(r.data?.data || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Manage Orders</h1>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[{ label: 'All', value: '' }, ...STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))].map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-teal-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p>No orders found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((o) => (
                <div key={o.id}>
                  <div
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-gray-400">{o.id.slice(0, 12)}...</p>
                      <p className="font-medium text-gray-900 text-sm mt-0.5">{o.users?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{formatDate(o.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900 text-sm">{formatPrice(o.total_amount)}</span>
                      <select
                        value={o.status}
                        onChange={(e) => { e.stopPropagation(); handleStatusChange(o.id, e.target.value); }}
                        disabled={updatingId === o.id}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border ${getOrderStatusColor(o.status)} cursor-pointer disabled:opacity-60`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <span className="text-gray-400 text-sm">{expanded === o.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {expanded === o.id && (
                    <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="pt-3 space-y-2">
                        {o.items?.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400 text-xs w-4 text-right">{item.quantity}x</span>
                            <span className="flex-1 text-gray-700">{item.product?.name}</span>
                            <span className="text-gray-900 font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                        {o.address && (
                          <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                            {o.address.line1}, {o.address.city}, {o.address.state} - {o.address.pincode}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
