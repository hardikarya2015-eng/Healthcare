import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/order.service';
import { addressService } from '../services/address.service';
import { formatPrice } from '../utils/helpers';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE, PAYMENT_METHODS } from '../constants';
import StripePaymentModal from '../components/StripePaymentModal';
import api from '../services/api';

const Checkout = () => {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const items = cart?.cart_items || [];

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', line1: '', city: '', state: '', pincode: '', phone: '' });

  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal + delivery;

  useEffect(() => {
    addressService.getAll().then((r) => {
      const list = r.data?.data || [];
      setAddresses(list);
      const def = list.find((a) => a.is_default) || list[0];
      if (def) setSelectedAddress(def.id);
    });
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const r = await addressService.add({ ...newAddr, is_default: addresses.length === 0 });
      const added = r.data?.data;
      setAddresses((prev) => [...prev, added]);
      setSelectedAddress(added.id);
      setShowAddForm(false);
      setNewAddr({ label: 'Home', line1: '', city: '', state: '', pincode: '', phone: '' });
      toast.success('Address added');
    } catch {
      toast.error('Failed to add address');
    }
  };

  // Called for COD or after Stripe succeeds
  const placeOrder = async (paymentIntentId = null) => {
    setPlacing(true);
    try {
      const r = await orderService.placeOrder({
        address_id: selectedAddress,
        payment_method: paymentMethod,
        ...(paymentIntentId && { payment_intent_id: paymentIntentId }),
      });
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${r.data?.data?.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return toast.error('Please select a delivery address');
    if (items.length === 0) return toast.error('Cart is empty');

    if (paymentMethod === 'online') {
      // Create Stripe PaymentIntent → open modal
      setPlacing(true);
      try {
        const res = await api.post('/api/payments/create-intent', { amount: total });
        setStripeClientSecret(res.data.data.client_secret);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not initiate payment');
      } finally {
        setPlacing(false);
      }
    } else {
      await placeOrder();
    }
  };

  const handleStripeSuccess = async (paymentIntentId) => {
    setStripeClientSecret(null);
    await placeOrder(paymentIntentId);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        <p className="text-5xl mb-4">🛒</p>
        <p className="font-medium">Your cart is empty</p>
        <Link to="/products" className="mt-4 inline-block text-teal-600 hover:underline">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left */}
        <div className="flex-1 space-y-5">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Delivery Address</h2>
              <button onClick={() => setShowAddForm(!showAddForm)} className="text-sm text-teal-600 hover:underline">
                + Add new
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddAddress} className="mb-4 space-y-3 p-4 bg-gray-50 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Label</label>
                    <select value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} className="input text-sm py-1.5">
                      {['Home', 'Work', 'Other'].map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Phone</label>
                    <input value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="input text-sm py-1.5" placeholder="10-digit number" maxLength={10} required />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Address Line</label>
                  <input value={newAddr.line1} onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                    className="input text-sm py-1.5" placeholder="Street, Building, Area" required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label text-xs">City</label>
                    <input value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="input text-sm py-1.5" required />
                  </div>
                  <div>
                    <label className="label text-xs">State</label>
                    <input value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="input text-sm py-1.5" required />
                  </div>
                  <div>
                    <label className="label text-xs">Pincode</label>
                    <input value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="input text-sm py-1.5" required />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm py-1.5 px-4">Save Address</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <p className="text-sm text-gray-400">No addresses saved. Add one above.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <label key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedAddress === a.id ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="address" value={a.id} checked={selectedAddress === a.id}
                      onChange={() => setSelectedAddress(a.id)} className="mt-0.5 accent-teal-500" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{a.label} {a.is_default && <span className="text-xs text-teal-600">(Default)</span>}</p>
                      <p className="text-gray-500">{a.line1}, {a.city}, {a.state} - {a.pincode}</p>
                      {a.phone && <p className="text-gray-400">{a.phone}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === m.value ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value}
                    onChange={() => setPaymentMethod(m.value)} className="accent-teal-500" />
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{m.label}</p>
                    {m.sub && <p className="text-xs text-gray-400">{m.sub}</p>}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-card p-5 sticky top-4">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 text-xs w-5 text-right">{item.quantity}x</span>
                  <span className="flex-1 text-gray-700 truncate">{item.products?.name}</span>
                  <span className="text-gray-900 font-medium flex-shrink-0">
                    {formatPrice((item.products?.discounted_price ?? item.products?.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                {delivery === 0
                  ? <span className="text-teal-600 font-medium">FREE</span>
                  : <span>{formatPrice(delivery)}</span>}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 mb-5 flex justify-between font-bold text-gray-900">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {placing ? 'Placing Order...' : `Pay ${formatPrice(total)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Stripe payment modal */}
      {stripeClientSecret && (
        <StripePaymentModal
          clientSecret={stripeClientSecret}
          amount={total}
          onSuccess={handleStripeSuccess}
          onClose={() => setStripeClientSecret(null)}
        />
      )}
    </div>
  );
};

export default Checkout;
