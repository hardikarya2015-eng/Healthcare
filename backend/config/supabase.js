const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env');
}

// Admin client — used for auth validation and admin operations
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

// User-scoped client — sets auth.uid() via the user's JWT so RLS policies work correctly
const createUserClient = (accessToken) =>
  createClient(supabaseUrl || '', supabaseServiceKey || '', {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });

module.exports = { supabase, createUserClient };
