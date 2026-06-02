import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [credError, setCredError] = useState('');
  const from = location.state?.from?.pathname || '/';

  const validateEmail = (value) => {
    if (!value) return 'Email address is required';
    if (!EMAIL_RE.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, email: val });
    if (emailTouched) setEmailError(validateEmail(val));
    if (credError) setCredError('');
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(form.email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    const err = validateEmail(form.email);
    if (err) { setEmailError(err); return; }

    setCredError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.full_name?.split(' ')[0]}!`);
      const dest = user.role === 'admin' ? '/admin' : from === '/' ? '/' : from;
      navigate(dest, { replace: true });
    } catch (err) {
      setCredError(err.response?.data?.message || 'Invalid email address or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm">Sign in to continue to MediSwift</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              className={`input ${emailError ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {emailError && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); if (credError) setCredError(''); }}
                className="input pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              </button>
            </div>
          </div>

          {credError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {credError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base mt-2"
          >
            {loading
              ? <span className="flex items-center gap-2 justify-center"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Signing in...</span>
              : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
