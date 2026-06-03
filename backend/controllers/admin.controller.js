const { supabase, createUserClient } = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');

const getStats = async (req, res) => {
  const db = createUserClient(req.token);
  const [
    { count: total_users },
    { count: total_products },
    { count: total_orders },
    { count: pending_orders },
    { count: pending_prescriptions },
  ] = await Promise.all([
    db.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    db.from('orders').select('*', { count: 'exact', head: true }),
    db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'placed'),
    db.from('prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  return successResponse(res, { total_users, total_products, total_orders, pending_orders, pending_prescriptions });
};

const getUsers = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const db = createUserClient(req.token);

  const { data, error, count } = await db
    .from('users').select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (error) return errorResponse(res, error.message, 500);
  return res.json({ success: true, data, total: count });
};

const getOrders = async (req, res) => {
  const { page = 1, limit = 50, status } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const db = createUserClient(req.token);

  let query = db
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
  const db = createUserClient(req.token);

  const { data, error } = await db
    .from('orders').update({ status }).eq('id', req.params.id).select().single();
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, 'Order status updated');
};

const getPrescriptions = async (req, res) => {
  const { status } = req.query;
  const db = createUserClient(req.token);

  let query = db
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
  const db = createUserClient(req.token);

  const { data, error } = await db
    .from('prescriptions').update({ status }).eq('id', req.params.id).select().single();
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, `Prescription ${status}`);
};

const getInventory = async (req, res) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(id, name, slug, manufacturer, is_active, image_url, category:categories(name))')
    .order('stock_quantity');
  if (error) return errorResponse(res, error.message, 500);
  return successResponse(res, data);
};

const updateInventory = async (req, res) => {
  const { quantity } = req.body;
  if (typeof quantity !== 'number') return errorResponse(res, 'quantity must be a number', 400);

  const { data, error } = await supabase
    .from('inventory')
    .update({ stock_quantity: quantity })
    .eq('id', req.params.id)
    .select().single();
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, 'Inventory updated');
};

const uploadProductImage = async (req, res) => {
  if (!req.file) return errorResponse(res, 'No image provided', 400);
  const { id } = req.params;

  const ext = req.file.originalname.split('.').pop() || 'jpg';
  const path = `products/${id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

  if (uploadError) return errorResponse(res, uploadError.message, 500);

  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('products').update({ image_url: publicUrl }).eq('id', id);

  if (updateError) return errorResponse(res, updateError.message, 500);
  return successResponse(res, { image_url: publicUrl }, 'Image updated');
};

module.exports = {
  getStats, getUsers, getOrders, updateOrderStatus,
  getPrescriptions, updatePrescriptionStatus,
  getInventory, updateInventory, uploadProductImage,
};
