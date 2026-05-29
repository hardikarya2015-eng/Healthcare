const supabase = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');

// Get or create cart for user, return with items
const getCart = async (req, res) => {
  const userId = req.user.id;

  // Ensure cart exists
  await supabase.from('carts').upsert({ user_id: userId }, { onConflict: 'user_id' });

  const { data: cart, error } = await supabase
    .from('carts')
    .select(`
      id,
      cart_items(
        id, quantity,
        products(id, name, slug, price, discount_percent, discounted_price, image_url, prescription_required,
          inventory(stock_quantity)
        )
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error) return errorResponse(res, error.message, 500);
  return successResponse(res, cart);
};

const addItem = async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) return errorResponse(res, 'product_id required', 400);

  // Check product exists and has stock
  const { data: inv } = await supabase
    .from('inventory').select('stock_quantity').eq('product_id', product_id).single();
  if (!inv || inv.stock_quantity < 1)
    return errorResponse(res, 'Product out of stock', 400);

  // Get cart
  const { data: cart } = await supabase
    .from('carts').select('id').eq('user_id', userId).single();
  if (!cart) return errorResponse(res, 'Cart not found', 404);

  // Upsert cart item
  const { data, error } = await supabase
    .from('cart_items')
    .upsert({ cart_id: cart.id, product_id, quantity }, { onConflict: 'cart_id,product_id' })
    .select('*, products(id, name, price, discounted_price, image_url)')
    .single();

  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, 'Item added to cart', 201);
};

const updateItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) return errorResponse(res, 'Quantity must be >= 1', 400);

  const { data: cart } = await supabase
    .from('carts').select('id').eq('user_id', userId).single();

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('cart_id', cart.id)
    .eq('product_id', productId)
    .select()
    .single();

  if (error || !data) return errorResponse(res, 'Item not in cart', 404);
  return successResponse(res, data, 'Cart updated');
};

const removeItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const { data: cart } = await supabase
    .from('carts').select('id').eq('user_id', userId).single();

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)
    .eq('product_id', productId);

  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, null, 'Item removed');
};

const clearCart = async (req, res) => {
  const userId = req.user.id;
  const { data: cart } = await supabase
    .from('carts').select('id').eq('user_id', userId).single();

  const { error } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, null, 'Cart cleared');
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
