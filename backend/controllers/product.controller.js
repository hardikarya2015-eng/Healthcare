const supabase = require('../config/supabase');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getProducts = async (req, res) => {
  const { search = '', category, category_slug, page = 1, limit = 20, sort = 'name', prescription_required } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Resolve category_slug to category_id
  let categoryId = category || null;
  if (category_slug && !categoryId) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category_slug).single();
    categoryId = cat?.id || null;
  }

  let query = supabase
    .from('products')
    .select(`
      *,
      categories(id, name, slug),
      inventory(stock_quantity)
    `, { count: 'exact' })
    .eq('is_active', true)
    .range(offset, offset + Number(limit) - 1);

  if (search) query = query.ilike('name', `%${search}%`);
  if (categoryId) query = query.eq('category_id', categoryId);
  if (prescription_required !== undefined)
    query = query.eq('prescription_required', prescription_required === 'true');

  if (sort === 'price_asc') query = query.order('discounted_price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('discounted_price', { ascending: false });
  else if (sort === 'discount') query = query.order('discount_percent', { ascending: false });
  else query = query.order('name');

  const { data, error, count } = await query;
  if (error) return errorResponse(res, error.message, 500);
  return paginatedResponse(res, data, count, page, limit);
};

const getSuggestions = async (req, res) => {
  const { q = '' } = req.query;
  if (q.trim().length < 2) return successResponse(res, []);

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, brand, manufacturer, categories(name, slug)')
    .eq('is_active', true)
    .ilike('name', `%${q.trim()}%`)
    .order('name')
    .limit(8);

  if (error) return errorResponse(res, error.message, 500);
  return successResponse(res, data);
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  // Support lookup by id or slug
  let query = supabase
    .from('products')
    .select('*, categories(id, name, slug), inventory(stock_quantity)');

  query = id.includes('-') && id.length < 36
    ? query.eq('slug', id)
    : query.eq('id', id);

  const { data, error } = await query.single();
  if (error || !data) return errorResponse(res, 'Product not found', 404);
  return successResponse(res, data);
};

const createProduct = async (req, res) => {
  const { stock_quantity = 0, ...productData } = req.body;

  // Auto-generate slug if not provided
  if (!productData.slug) {
    productData.slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const { data, error } = await supabase.from('products').insert(productData).select().single();
  if (error) return errorResponse(res, error.message, 400);

  // Create inventory record
  await supabase.from('inventory').insert({ product_id: data.id, stock_quantity });

  return successResponse(res, data, 'Product created', 201);
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { stock_quantity, ...productData } = req.body;

  const { data, error } = await supabase
    .from('products').update(productData).eq('id', id).select().single();
  if (error) return errorResponse(res, error.message, 400);

  if (stock_quantity !== undefined) {
    await supabase.from('inventory')
      .update({ stock_quantity }).eq('product_id', id);
  }

  return successResponse(res, data, 'Product updated');
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id);
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, null, 'Product deactivated');
};

module.exports = { getProducts, getSuggestions, getProductById, createProduct, updateProduct, deleteProduct };
