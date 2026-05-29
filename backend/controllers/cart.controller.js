const { supabase, createUserClient } = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');

const getCart = async (req, res) => {
  const userId = req.user.id;
  const db = createUserClient(req.token);

  await db.from('carts').upsert({ user_id: userId }, { onConflict: 'user_id' });

  const { data: cart, error } = await db
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
  const db = createUserClient(req.token);

  if (!product_id) return errorResponse(res, 'product_id required', 400);

  const { data: inv } = await supabase
    .from('inventory').select('stock_quantity').eq('product_id', product_id).single();
  if (!inv || inv.stock_quantity < 1)
    return errorResponse(res, 'Product out of stock', 400);

  const { data: cart } = await db
    .from('carts').select('id').eq('user_id', userId).single();
  if (!cart) return errorResponse(res, 'Cart not found', 404);

  const { data, error } = await db
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
  const db = createUserClient(req.token);

  if (!quantity || quantity < 1) return errorResponse(res, 'Quantity must be >= 1', 400);

  const { data: cart } = await db
    .from('carts').select('id').eq('user_id', userId).single();

  const { data, error } = await db
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
  const db = createUserClient(req.token);

  const { data: cart } = await db
    .from('carts').select('id').eq('user_id', userId).single();

  const { error } = await db
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)
    .eq('product_id', productId);

  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, null, 'Item removed');
};

const clearCart = async (req, res) => {
  const userId = req.user.id;
  const db = createUserClient(req.token);

  const { data: cart } = await db
    .from('carts').select('id').eq('user_id', userId).single();

  const { error } = await db.from('cart_items').delete().eq('cart_id', cart.id);
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, null, 'Cart cleared');
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
