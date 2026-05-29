import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartService } from '../services/cart.service';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart(null); setRxVerified(false); return; }
    setLoading(true);
    try {
      const { data } = await cartService.getCart();
      const cartData = data.data;
      setCart(cartData);

    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add items to cart'); return false; }
    try {
      await cartService.addItem(productId, quantity);
      await fetchCart();
      toast.success('Added to cart');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await cartService.updateItem(productId, quantity);
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartService.removeItem(productId);
      await fetchCart();
      toast.success('Item removed');
    } catch {
      toast.error('Remove failed');
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await fetchCart();
    } catch { /* silent */ }
  };

  const itemCount = cart?.cart_items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  const subtotal = cart?.cart_items?.reduce((sum, i) => {
    const price = i.products?.discounted_price ?? i.products?.price ?? 0;
    return sum + price * i.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart, loading, itemCount, subtotal,
      fetchCart, addToCart, updateQuantity, removeFromCart, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
