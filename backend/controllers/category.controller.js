const supabase = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');

const getAll = async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) return errorResponse(res, error.message, 500);
  return successResponse(res, data);
};

const getProductsByCategory = async (req, res) => {
  const { slug } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const { data: category } = await supabase
    .from('categories').select('id').eq('slug', slug).single();
  if (!category) return errorResponse(res, 'Category not found', 404);

  const { data, error, count } = await supabase
    .from('products')
    .select('*, inventory(stock_quantity)', { count: 'exact' })
    .eq('category_id', category.id)
    .eq('is_active', true)
    .range(offset, offset + Number(limit) - 1);

  if (error) return errorResponse(res, error.message, 500);
  return res.json({ success: true, data, total: count });
};

const create = async (req, res) => {
  const { name, description, image_url, sort_order } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('categories').insert({ name, slug, description, image_url, sort_order }).select().single();
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, 'Category created', 201);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('categories').update(req.body).eq('id', id).select().single();
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, 'Category updated');
};

module.exports = { getAll, getProductsByCategory, create, update };
