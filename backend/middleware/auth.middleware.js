const supabase = require('../config/supabase');

/**
 * Verifies the Supabase JWT token from the Authorization header.
 * Attaches req.user on success.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  req.user = user;
  next();
};

/**
 * Requires a specific role. Must be used after authenticate.
 */
const requireRole = (...roles) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  // Fetch user role from our users table
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (error || !data) {
    return res.status(403).json({ success: false, message: 'Could not verify role' });
  }

  if (!roles.includes(data.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}`,
    });
  }

  req.userRole = data.role;
  next();
};

module.exports = { authenticate, requireRole };
