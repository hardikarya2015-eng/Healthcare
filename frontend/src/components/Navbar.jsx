import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import toast from 'react-hot-toast';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [baseQuery, setBaseQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const res = await api.get(`/api/products/suggestions?q=${encodeURIComponent(q.trim())}`);
      setSuggestions(res.data.data || []);
      setSuggestionsOpen(true);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    setBaseQuery(val);
    setActiveIndex(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const commitSearch = (q) => {
    if (!q.trim()) return;
    setSuggestionsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setBaseQuery('');
    setSearchVal(q);
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = activeIndex >= 0 && suggestions[activeIndex] ? suggestions[activeIndex].name : searchVal;
    commitSearch(q);
  };

  const handleKeyDown = (e) => {
    if (!suggestionsOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(activeIndex + 1, suggestions.length - 1);
      setActiveIndex(next);
      setSearchVal(suggestions[next].name);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = activeIndex - 1;
      setActiveIndex(prev);
      setSearchVal(prev < 0 ? baseQuery : suggestions[prev].name);
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
      setActiveIndex(-1);
      setSearchVal(baseQuery);
    }
  };

  const handleSuggestionClick = (s) => {
    commitSearch(s.name);
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Logo size={34} />
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Pharm<span className="text-teal-600">Easy</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex w-full rounded-xl overflow-hidden border border-gray-200 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
                <div className="flex items-center pl-3 text-gray-400">
                  {loadingSuggestions
                    ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  }
                </div>
                <input
                  value={searchVal}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
                  type="text"
                  placeholder="Search medicines, vitamins, devices..."
                  className="flex-1 px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-5 text-sm font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {suggestionsOpen && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                >
                  <p className="px-4 py-2 text-xs text-gray-400 border-b border-gray-50">
                    Showing results for <span className="font-semibold text-gray-600">{baseQuery}</span>
                  </p>
                  <ul>
                    {suggestions.map((s, i) => {
                      const lowerName = s.name.toLowerCase();
                      const lowerQuery = baseQuery.toLowerCase();
                      const matchEnd = lowerName.startsWith(lowerQuery) ? baseQuery.length : 0;
                      const typedPart = matchEnd > 0 ? s.name.slice(0, matchEnd) : s.name;
                      const completionPart = matchEnd > 0 ? s.name.slice(matchEnd) : '';
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(-1)}
                            onClick={() => handleSuggestionClick(s)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${i === activeIndex ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <span className="text-sm text-gray-800 truncate">
                                {typedPart}<span className="font-bold">{completionPart}</span>
                              </span>
                            </div>
                            <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 rotate-[-45deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:block text-sm font-medium">Cart</span>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-teal-500 text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[1.1rem] min-h-[1.1rem] rounded-full flex items-center justify-center leading-none px-1"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </Link>

            {/* Auth — desktop */}
            {user ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-gray-800 leading-tight">{user.full_name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-400 capitalize leading-tight">{user.role}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm">{user.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                          My Orders
                        </Link>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          Profile
                        </Link>
                        <Link to="/upload-prescription" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          Prescriptions
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50 transition-colors" onClick={() => setProfileOpen(false)}>
                            <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-xl transition-colors shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                <input
                  value={searchVal}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  type="text"
                  placeholder="Search medicines..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  autoComplete="off"
                />
                <button type="submit" className="bg-teal-500 text-white px-3 rounded-lg text-sm">Go</button>
              </form>
              <Link to="/products" className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMenuOpen(false)}>
                Products
              </Link>
              <Link to="/cart" className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMenuOpen(false)}>
                <span>Cart</span>
                {itemCount > 0 && <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">{itemCount}</span>}
              </Link>
              {user ? (
                <>
                  <Link to="/orders" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMenuOpen(false)}>My Orders</Link>
                  <Link to="/profile" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMenuOpen(false)}>Profile</Link>
                  {isAdmin && <Link to="/admin" className="block px-3 py-2.5 text-sm text-teal-700 hover:bg-teal-50 rounded-xl" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl">Sign out</button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-medium border border-gray-200 rounded-xl" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="flex-1 text-center py-2.5 text-sm font-semibold bg-teal-500 text-white rounded-xl" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
