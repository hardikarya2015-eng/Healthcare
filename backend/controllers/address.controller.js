const supabase = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');

const getAddresses = async (req, res) => {
  const { data, error } = await supabase
    .from('addresses').select('*').eq('user_id', req.user.id).order('is_default', { ascending: false });
  if (error) return errorResponse(res, error.message, 500);
  return successResponse(res, data);
};

const addAddress = async (req, res) => {
  const { is_default, ...rest } = req.body;

  if (is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({ ...rest, user_id: req.user.id, is_default: !!is_default })
    .select().single();

  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, 'Address added', 201);
};

const updateAddress = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('addresses').update(req.body).eq('id', id).eq('user_id', req.user.id).select().single();
  if (error || !data) return errorResponse(res, 'Address not found', 404);
  return successResponse(res, data, 'Address updated');
};

const deleteAddress = async (req, res) => {
  const { error } = await supabase
    .from('addresses').delete().eq('id', req.params.id).eq('user_id', req.user.id);
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, null, 'Address deleted');
};

const setDefault = async (req, res) => {
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id);
  const { data, error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', req.params.id).eq('user_id', req.user.id)
    .select().single();
  if (error || !data) return errorResponse(res, 'Address not found', 404);
  return successResponse(res, data, 'Default address set');
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefault };
