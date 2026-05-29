import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, formatPrice, getOrderStatusColor, capitalize, getEstimatedDelivery } from '../utils/helpers';
import { ORDER_STATUS_STEPS } from '../constants';

const OrderCard = ({ order, onCancel }) => {
  const { id, status, created_at, total_amount, items, payment_method } = order;
  const order_items = items;
  const stepIndex = ORDER_STATUS_STEPS.indexOf(status);
  const edd = getEstimatedDelivery(order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-card p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
        <div>
          <p className="text-xs text-gray-400">Order ID</p>
          <p className="font-mono text-sm font-semibold text-gray-700">{id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <span className={`badge ${getOrderStatusColor(status)}`}>{capitalize(status)}</span>
          <p className="text-xs text-gray-400 mt-1">{formatDate(created_at)}</p>
        </div>
      </div>

      {/* Progress bar — only for active orders */}
      {stepIndex >= 0 && status !== 'cancelled' && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            {ORDER_STATUS_STEPS.map((step, i) => (
              <span key={step} className={`text-xs ${i <= stepIndex ? 'text-teal-600 font-medium' : 'text-gray-300'}`}>
                {capitalize(step)}
              </span>
            ))}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${((stepIndex + 1) / ORDER_STATUS_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Estimated delivery */}
      {edd && (
        <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 rounded-lg px-3 py-1.5 mb-3">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Estimated delivery in <strong>{edd}</strong></span>
        </div>
      )}

      {/* Items preview */}
      <div className="space-y-1 mb-4">
        {order_items?.slice(0, 3).map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-gray-600">
            <span className="truncate max-w-[70%]">{item.product_name} × {item.quantity}</span>
            <span>{formatPrice(item.total_price)}</span>
          </div>
        ))}
        {order_items?.length > 3 && (
          <p className="text-xs text-gray-400">+{order_items.length - 3} more items</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">{capitalize(payment_method)}</p>
          <p className="font-bold text-gray-900">{formatPrice(total_amount)}</p>
        </div>
        <div className="flex space-x-2">
          {['placed', 'confirmed'].includes(status) && onCancel && (
            <button
              onClick={() => onCancel(id)}
              className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <Link
            to={`/orders/${id}`}
            className="text-sm text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;
