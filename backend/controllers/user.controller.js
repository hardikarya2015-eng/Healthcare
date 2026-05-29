const { supabase } = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');

const getProfile = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return errorResponse(res, 'User not found', 404);
  return successResponse(res, data);
};

const updateProfile = async (req, res) => {
  const { full_name, phone, avatar_url } = req.body;

  const { data, error } = await supabase
    .from('users')
    .update({ full_name, phone, avatar_url })
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, 'Profile updated');
};

module.exports = { getProfile, updateProfile };
