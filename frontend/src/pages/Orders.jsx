import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import OrderCard from '../components/OrderCard';
import { orderService } from '../services/order.service';
import { ORDER_STATUS } from '../constants';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'placed' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    orderService.getMyOrders().then((r) => setOrders(r.data?.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  const handleCancel = (id) => setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'cancelled' } : o));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Orders</h1>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-teal-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl shadow-card">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-medium">No orders yet</p>
          <Link to="/products" className="mt-3 inline-block text-teal-600 hover:underline text-sm">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
