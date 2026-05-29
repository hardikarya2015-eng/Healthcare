import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === 'email') setEmailError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    if (form.password !== form.confirm_password) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await register({ full_name: form.full_name, email: form.email, password: form.password, phone: form.phone });
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      const isAlreadyRegistered = ['already registered', 'already been registered', 'already exists']
        .some((s) => message.toLowerCase().includes(s));

      if (isAlreadyRegistered) {
        setEmailError('This email is already registered.');
        toast(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-900">Account already exists</span>
              <button onClick={() => { toast.dismiss(t.id); navigate('/login'); }} className="text-sm text-teal-600 font-semibold underline text-left">
                Sign in instead →
              </button>
            </div>
          ),
          { duration: 6000, icon: '⚠️' }
        );
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-teal-500'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Create account</h1>
        <p className="text-gray-500 text-sm">Join PharmEasy for fast medicine delivery</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input name="full_name" type="text" value={form.full_name} onChange={handleChange}
              className="input" placeholder="John Doe" required autoComplete="name" />
          </div>

          <div>
            <label className="label">Email address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className={`input ${emailError ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="you@example.com" required autoComplete="email" />
            {emailError && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {emailError}{' '}
                <Link to="/login" className="underline font-semibold text-red-600">Sign in instead</Link>
              </p>
            )}
          </div>

          <div>
            <label className="label">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange}
              className="input" placeholder="+91 99999 00000" autoComplete="tel" />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input name="password" type={showPwd ? 'text' : 'password'} value={form.password}
                onChange={handleChange} className="input pr-10" placeholder="Min 6 characters" required minLength={6} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${strength >= i ? strengthColor[strength] : 'bg-gray-200'}`} />
                  ))}
                </div>
                <span className={`text-xs font-medium ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-500' : 'text-teal-600'}`}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <input name="confirm_password" type="password" value={form.confirm_password}
              onChange={handleChange} className="input" placeholder="Repeat password" required />
            {form.confirm_password && form.password !== form.confirm_password && (
              <p className="mt-1.5 text-xs text-red-500">Passwords don&apos;t match</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-1">
            {loading
              ? <span className="flex items-center gap-2 justify-center"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Creating account...</span>
              : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
