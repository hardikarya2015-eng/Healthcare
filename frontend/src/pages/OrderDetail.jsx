import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { orderService } from '../services/order.service';
import { formatPrice, formatDate, getOrderStatusColor, getEstimatedDelivery } from '../utils/helpers';
import { ORDER_STATUS_STEPS } from '../constants';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderService.getById(id).then((r) => setOrder(r.data?.data)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await orderService.cancel(id);
      setOrder((prev) => ({ ...prev, status: 'cancelled' }));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="py-12"><Loader /></div>;
  if (!order) return (
    <div className="text-center py-16 text-gray-400">
      <p>Order not found.</p>
      <Link to="/orders" className="text-teal-600 hover:underline mt-2 inline-block">Back to orders</Link>
    </div>
  );

  const stepIndex = ORDER_STATUS_STEPS.indexOf(order.status);
  const isActive = stepIndex >= 0;
  const canCancel = ['placed', 'confirmed'].includes(order.status);
  const edd = getEstimatedDelivery(order);

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link to="/orders" className="text-sm text-teal-600 hover:underline flex items-center gap-1">
        ← Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
            <p className="font-mono text-sm text-gray-700">{order.id}</p>
          </div>
          <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
          <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling}
              className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1 rounded-lg transition-colors disabled:opacity-60">
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        {/* Estimated delivery */}
        {edd && (
          <div className="mt-4 flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Estimated delivery in <strong>{edd}</strong></span>
          </div>
        )}

        {/* Progress bar */}
        {isActive && order.status !== 'cancelled' && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              {ORDER_STATUS_STEPS.map((s) => (
                <span key={s} className={ORDER_STATUS_STEPS.indexOf(s) <= stepIndex ? 'text-teal-600 font-medium' : ''}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              ))}
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / ORDER_STATUS_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Items */}
        <div className="flex-1 bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.product_image
                    ? <img src={item.product_image} alt="" className="w-full h-full object-contain rounded-lg" />
                    : <span className="text-2xl">💊</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatPrice(item.unit_price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="w-full lg:w-72 space-y-4 flex-shrink-0">
          {/* Price Summary */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Price Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                {order.delivery_charge === 0
                  ? <span className="text-teal-600">FREE</span>
                  : <span>{formatPrice(order.delivery_charge)}</span>}
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span><span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Delivery Address</h2>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-800">{order.address.label}</p>
                <p>{order.address.line1}</p>
                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                {order.address.phone && <p className="mt-1 text-gray-400">{order.address.phone}</p>}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-semibold text-gray-900 mb-2">Payment</h2>
            <p className="text-sm text-gray-600 capitalize">{order.payment_method?.replace('_', ' ')}</p>
            <p className={`text-xs mt-1 font-medium ${order.payment_status === 'paid' ? 'text-teal-600' : 'text-orange-500'}`}>
              {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
