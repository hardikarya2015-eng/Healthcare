const { supabase, createUserClient } = require('../config/supabase');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const DELIVERY_CHARGE = 49;
const FREE_DELIVERY_THRESHOLD = 499;

const placeOrder = async (req, res) => {
  const userId = req.user.id;
  const { address_id, payment_method = 'cod', payment_intent_id, prescription_id, notes } = req.body;
  const db = createUserClient(req.token);

  if (!address_id) return errorResponse(res, 'Delivery address required', 400);

  // Fetch cart with items
  const { data: cart } = await db
    .from('carts')
    .select(`id, cart_items(quantity, products(id, name, price, discounted_price, discount_percent, image_url, prescription_required, inventory(stock_quantity)))`)
    .eq('user_id', userId)
    .single();

  if (!cart?.cart_items?.length)
    return errorResponse(res, 'Cart is empty', 400);

  // Check stock
  for (const item of cart.cart_items) {
    const stock = item.products?.inventory?.stock_quantity ?? 0;
    if (item.quantity > stock)
      return errorResponse(res, `Insufficient stock for ${item.products?.name}`, 400);
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = cart.cart_items.map(item => {
    const unitPrice = item.products.discounted_price ?? item.products.price;
    const total = unitPrice * item.quantity;
    subtotal += total;
    return {
      product_id: item.products.id,
      product_name: item.products.name,
      product_image: item.products.image_url || null,
      quantity: item.quantity,
      unit_price: unitPrice,
      discount_percent: item.products.discount_percent,
      total_price: total,
    };
  });

  const delivery_charge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total_amount = subtotal + delivery_charge;
  const payment_status = payment_method === 'online' && payment_intent_id ? 'paid' : 'pending';

  // Create order
  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      user_id: userId, address_id, prescription_id, payment_method, payment_intent_id,
      payment_status, subtotal, delivery_charge, total_amount, notes,
    })
    .select()
    .single();

  if (orderError) return errorResponse(res, orderError.message, 500);

  // Insert order items
  const { error: itemsError } = await db
    .from('order_items')
    .insert(orderItems.map(i => ({ ...i, order_id: order.id })));
  if (itemsError) console.error('order_items insert FAILED:', itemsError.message);

  // Deduct stock (admin operation — uses service role)
  for (const item of cart.cart_items) {
    const { data: inv } = await supabase
      .from('inventory').select('stock_quantity').eq('product_id', item.products.id).single();
    if (inv) {
      await supabase.from('inventory')
        .update({ stock_quantity: inv.stock_quantity - item.quantity })
        .eq('product_id', item.products.id);
    }
  }

  // Clear cart
  await db.from('cart_items').delete().eq('cart_id', cart.id);

  return successResponse(res, order, 'Order placed successfully', 201);
};

const getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const db = createUserClient(req.token);

  const { data, error, count } = await db
    .from('orders')
    .select('*, items:order_items(*)', { count: 'exact' })
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (error) return errorResponse(res, error.message, 500);
  return paginatedResponse(res, data, count, page, limit);
};

const getOrderById = async (req, res) => {
  const db = createUserClient(req.token);

  const { data: order, error } = await db
    .from('orders')
    .select('*, address:addresses(*)')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error || !order) return errorResponse(res, 'Order not found', 404);

  const { data: items } = await db
    .from('order_items')
    .select('*')
    .eq('order_id', req.params.id);

  order.items = items || [];
  return successResponse(res, order);
};

const cancelOrder = async (req, res) => {
  const db = createUserClient(req.token);

  const { data: existing } = await db
    .from('orders').select('status').eq('id', req.params.id).eq('user_id', req.user.id).single();

  if (!existing) return errorResponse(res, 'Order not found', 404);
  if (!['placed', 'confirmed'].includes(existing.status))
    return errorResponse(res, 'Order cannot be cancelled at this stage', 400);

  // Use service role for the update (bypasses missing UPDATE RLS policy)
  // Avoid .single() — if RLS silently returns 0 rows it throws "Cannot coerce to single JSON object"
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, { id: req.params.id, status: 'cancelled' }, 'Order cancelled');
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder };
