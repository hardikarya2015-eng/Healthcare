const { supabase } = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  const { email, password, full_name, phone } = req.body;
  const role = 'customer'; // public registration always creates customers

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role, phone },
  });

  if (error) return errorResponse(res, error.message, 400);

  const userId = data.user.id;

  // Upsert profile (trigger may have already done this)
  const { error: profileError } = await supabase.from('users').upsert({
    id: userId, full_name, email, phone: phone || null, role,
  }, { onConflict: 'id' });

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return errorResponse(res, 'Failed to create user profile: ' + profileError.message, 500);
  }

  // Ensure cart exists
  await supabase.from('carts').upsert({ user_id: userId }, { onConflict: 'user_id' });

  return successResponse(res, { user: { id: userId, email, full_name, role } }, 'Registration successful', 201);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return errorResponse(res, 'Invalid email or password', 401);

  const { data: userData } = await supabase
    .from('users')
    .select('id, full_name, email, role, avatar_url, phone')
    .eq('id', data.user.id)
    .single();

  return successResponse(res, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: userData,
  }, 'Login successful');
};

const logout = async (req, res) => {
  return successResponse(res, null, 'Logged out successfully');
};

const getMe = async (req, res) => {
  const { data, error } = await supabase
    .from('users').select('*').eq('id', req.user.id).single();
  if (error) return errorResponse(res, 'User not found', 404);
  return successResponse(res, data);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.CLIENT_URL}/reset-password`,
  });
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, null, 'Password reset email sent');
};

module.exports = { register, login, logout, getMe, forgotPassword };
