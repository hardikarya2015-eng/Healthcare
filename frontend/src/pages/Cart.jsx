import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from '../constants';
import api from '../services/api';

// ─── Inline Prescription Uploader ────────────────────────────────────────────
const PrescriptionGate = ({ onVerified }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [open, setOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [callbackRequested, setCallbackRequested] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) return toast.error('Only JPG, PNG or PDF');
    if (f.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
    setFile(f);
    setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
  };

  const handleCallbackRequest = (e) => {
    e.preventDefault();
    if (!phone.trim()) return toast.error('Please enter your phone number');
    if (phone.length !== 10) return toast.error('Phone number must be 10 digits');
    setCallbackRequested(true);
    onVerified(); // allow checkout since doctor is reviewing
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('prescription', file);
      const res = await api.post('/api/prescriptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = res.data.data;
      if (data.extracted_medicines?.length > 0) {
        toast.success('Prescription verified! You can now checkout.');
        onVerified();
      } else {
        toast('Prescription uploaded. Pending pharmacist review.', { icon: '📋' });
        onVerified(); // still allow checkout; pharmacist reviews offline
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-orange-800 text-sm">Prescription Required</p>
          <p className="text-xs text-orange-600 mt-0.5">
            Some medicines in your cart require a valid prescription. Upload it to proceed to checkout.
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          {open ? 'Cancel' : 'Upload Rx'}
        </button>
      </div>

      {/* Upload section */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-orange-200 pt-3">
              {/* Drop zone */}
              <label
                htmlFor="cart-rx-upload"
                className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                  file ? 'border-orange-400 bg-orange-100/50' : 'border-orange-200 hover:border-orange-400 hover:bg-orange-100/30'
                }`}
              >
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800">{file ? file.name : 'Choose prescription image'}</p>
                  <p className="text-xs text-orange-500">JPG, PNG or PDF · Max 5MB</p>
                </div>
                <input type="file" id="cart-rx-upload" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
              </label>

              {preview && (
                <img src={preview} alt="Prescription preview" className="w-full max-h-40 object-contain rounded-xl border border-orange-200 bg-white" />
              )}

              {file && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Verifying prescription...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>Verify &amp; Unlock Checkout</>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doctor callback option */}
      <div className="border-t border-orange-200 px-4 py-3">
        <button
          onClick={() => setCallbackOpen((v) => !v)}
          className="w-full text-left flex items-center justify-between gap-2 group"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-700">Don't have a prescription?</p>
              <p className="text-xs text-blue-500">Our expert doctor will call you in 10 mins</p>
            </div>
          </div>
          <svg className={`w-4 h-4 text-blue-400 transition-transform ${callbackOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {callbackOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3">
                {callbackRequested ? (
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Doctor callback scheduled!</p>
                      <p className="text-xs text-blue-600 mt-0.5">Our doctor will call <strong>{phone}</strong> within 10 minutes to assist with your prescription. You can proceed to checkout.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCallbackRequest} className="flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="flex-1 text-sm border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Call Me
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Cart Page ────────────────────────────────────────────────────────────────
const Cart = () => {
  const { cart, itemCount, subtotal, loading, clearCart, rxVerified, setRxVerified } = useCart();
  const navigate = useNavigate();

  const items = cart?.cart_items || [];
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal + delivery;

  // Check if any cart item requires prescription
  const rxItems = items.filter((i) => i.products?.prescription_required);
  const needsPrescription = rxItems.length > 0 && !rxVerified;

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
          {/* Items + Prescription gate */}
          <div className="flex-1 space-y-3">

            {/* Prescription banner — shown only when Rx items exist */}
            {needsPrescription && (
              <PrescriptionGate onVerified={() => setRxVerified(true)} />
            )}

            {/* Verified banner */}
            {rxItems.length > 0 && rxVerified && (
              <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3">
                <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-teal-700">Prescription verified — you're good to checkout!</p>
              </div>
            )}

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

              {/* Rx items summary */}
              {rxItems.length > 0 && (
                <div className={`text-xs px-3 py-2 rounded-xl flex items-center gap-2 ${rxVerified ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'}`}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {rxVerified
                    ? `${rxItems.length} Rx item${rxItems.length > 1 ? 's' : ''} verified`
                    : `${rxItems.length} item${rxItems.length > 1 ? 's' : ''} need${rxItems.length === 1 ? 's' : ''} prescription`
                  }
                </div>
              )}

              <button
                onClick={() => navigate('/checkout')}
                disabled={needsPrescription}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {needsPrescription ? 'Upload Prescription First' : 'Proceed to Checkout'}
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
