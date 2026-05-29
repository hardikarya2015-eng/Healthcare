const { supabase } = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');

const getStats = async (req, res) => {
  const [
    { count: total_users },
    { count: total_products },
    { count: total_orders },
    { count: pending_orders },
    { count: pending_prescriptions },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'placed'),
    supabase.from('prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return successResponse(res, { total_users, total_products, total_orders, pending_orders, pending_prescriptions });
};

const getUsers = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const { data, error, count } = await supabase
    .from('users').select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (error) return errorResponse(res, error.message, 500);
  return res.json({ success: true, data, total: count });
};

const getOrders = async (req, res) => {
  const { page = 1, limit = 50, status } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = supabase
    .from('orders')
    .select(`
      *,
      users(full_name, email),
      addresses(label, line1, city, state, pincode, phone),
      items:order_items(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) return errorResponse(res, error.message, 500);
  return res.json({ success: true, data, total: count });
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase
    .from('orders').update({ status }).eq('id', req.params.id).select().single();
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, 'Order status updated');
};

const getPrescriptions = async (req, res) => {
  const { status } = req.query;
  let query = supabase
    .from('prescriptions')
    .select('*, users(full_name, email)')
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return errorResponse(res, error.message, 500);
  return successResponse(res, data);
};

const updatePrescriptionStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'approved', 'rejected'];
  if (!allowed.includes(status)) return errorResponse(res, 'Invalid status', 400);

  const { data, error } = await supabase
    .from('prescriptions').update({ status }).eq('id', req.params.id).select().single();
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, `Prescription ${status}`);
};

const getInventory = async (req, res) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(id, name, slug, manufacturer, is_active, category:categories(name))')
    .order('quantity');
  if (error) return errorResponse(res, error.message, 500);
  return successResponse(res, data);
};

const updateInventory = async (req, res) => {
  const { quantity } = req.body;
  if (typeof quantity !== 'number') return errorResponse(res, 'quantity must be a number', 400);

  const { data, error } = await supabase
    .from('inventory')
    .update({ quantity })
    .eq('id', req.params.id)
    .select().single();
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, 'Inventory updated');
};

module.exports = {
  getStats, getUsers, getOrders, updateOrderStatus,
  getPrescriptions, updatePrescriptionStatus,
  getInventory, updateInventory,
};
