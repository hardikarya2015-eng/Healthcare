import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from '../constants';

const Cart = () => {
  const { cart, itemCount, subtotal, loading, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart?.cart_items || [];
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal + delivery;

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">Loading cart...</div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart {itemCount > 0 && <span className="text-teal-600">({itemCount} items)</span>}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</p>
          <p className="text-sm mb-6">Add some medicines and health products to get started</p>
          <Link to="/products" className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart items */}
          <div className="flex-1 space-y-3">

            {/* Cart items */}
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <CartItem item={item} />
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="text-right">
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                Clear cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-card p-5 sticky top-4 space-y-4">
              <h2 className="font-bold text-gray-900">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  {delivery === 0
                    ? <span className="text-teal-600 font-medium">FREE</span>
                    : <span>{formatPrice(delivery)}</span>
                  }
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-gray-400">
                    Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Proceed to Checkout
              </button>

              <Link to="/products" className="block text-center text-sm text-teal-600 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
