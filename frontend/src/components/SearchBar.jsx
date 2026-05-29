import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../services/api';

const SearchBar = ({ placeholder = 'Search medicines, vitamins, devices...' }) => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [baseQuery, setBaseQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await api.get(`/api/products/suggestions?q=${encodeURIComponent(q.trim())}`);
      const list = res.data.data || [];
      setSuggestions(list);
      setOpen(list.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    setBaseQuery(val);
    setActiveIndex(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const commit = (q) => {
    if (!q.trim()) return;
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setBaseQuery('');
    setSearchVal(q);
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = activeIndex >= 0 && suggestions[activeIndex] ? suggestions[activeIndex].name : searchVal;
    commit(q);
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
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
      setOpen(false);
      setActiveIndex(-1);
      setSearchVal(baseQuery);
    }
  };

  const handleBlur = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full" onBlur={handleBlur}>
      <form onSubmit={handleSubmit}>
        <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden p-1.5">
          <div className="flex items-center pl-3 text-gray-400">
            {loading
              ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            }
          </div>
          <input
            value={searchVal}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            type="text"
            placeholder={placeholder}
            autoComplete="off"
            className="flex-1 px-3 py-3 text-gray-800 text-sm focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
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
                      tabIndex={-1}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseLeave={() => setActiveIndex(-1)}
                      onMouseDown={(e) => { e.preventDefault(); commit(s.name); }}
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
                      <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
};

export default SearchBar;
