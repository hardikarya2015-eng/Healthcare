import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import Loader from '../components/Loader';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { CATEGORIES } from '../constants';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      productService.getProducts({ limit: 8, sort: 'discount' }),
      categoryService.getAll(),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data?.data || []);
      setCategories(cRes.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const displayCategories = categories.length > 0
    ? categories.map(c => ({ ...c, icon: CATEGORIES.find(k => k.slug === c.slug)?.icon || '🏥' }))
    : CATEGORIES;

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#062e38] via-[#0a3d4a] to-[#083344]">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-900/30 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">

            {/* Badge */}
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
              Trusted by 50 lakh+ customers
            </motion.div>

            <motion.h1 {...fadeUp(0.08)} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5">
              Medicines Delivered<br />
              <span className="text-teal-200">to Your Doorstep</span>
            </motion.h1>

            <motion.p {...fadeUp(0.16)} className="text-teal-100 text-lg mb-8 leading-relaxed">
              Order prescription medicines, vitamins & health essentials.<br className="hidden md:block" />
              Fast delivery. Genuine products. Guaranteed.
            </motion.p>

            {/* Search */}
            <motion.div {...fadeUp(0.22)} className="max-w-xl mx-auto">
              <SearchBar placeholder="Search for medicines, vitamins, devices..." />
            </motion.div>

            <motion.div {...fadeUp(0.3)} className="mt-4">
              <Link
                to="/upload-prescription"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Have a prescription? Upload &amp; order instantly →
              </Link>
            </motion.div>
          </div>

          {/* Trust metrics */}
          <motion.div {...fadeUp(0.36)} className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '5L+', label: 'Happy Customers' },
              { value: '50K+', label: 'Products Listed' },
              { value: '2 Hrs', label: 'Avg Delivery' },
              { value: '100%', label: 'Genuine Products' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl py-4 px-2 border border-white/15">
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-teal-200 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Offer Banners ── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🎉', label: 'Flat 20% OFF', sub: 'On your first order', bg: 'from-teal-500 to-emerald-600' },
              { icon: '🚚', label: 'Free Delivery', sub: 'On orders above ₹499', bg: 'from-blue-500 to-blue-600' },
              { icon: '📋', label: 'Upload Prescription', sub: 'Get medicines at doorstep', bg: 'from-orange-500 to-orange-600' },
            ].map(({ icon, label, sub, bg }) => (
              <div key={label} className={`bg-gradient-to-r ${bg} rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm`}>
                <div className="text-3xl">{icon}</div>
                <div>
                  <p className="font-bold text-white text-sm">{label}</p>
                  <p className="text-white/75 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-gray-400 text-sm mt-1">Find what you need quickly</p>
            </div>
            <Link to="/products" className="text-teal-600 text-sm font-medium hover:text-teal-700 flex items-center gap-1">
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {displayCategories.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Deals ── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Best Deals Today</h2>
              <p className="text-gray-400 text-sm mt-1">Biggest discounts, hand-picked for you</p>
            </div>
            <Link to="/products?sort=discount" className="text-teal-600 text-sm font-medium hover:text-teal-700 flex items-center gap-1">
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {loading ? (
            <Loader />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <Logo size={56} className="mx-auto opacity-20 mb-4" />
              <p className="font-medium">Products will appear here once inventory is added.</p>
              <Link to="/admin/products" className="mt-3 inline-block text-teal-600 text-sm hover:underline">Add products →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Upload Rx CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center text-4xl">
              📋
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Have a Prescription?</h2>
              <p className="text-gray-500 mb-5 leading-relaxed">
                Upload your doctor&apos;s prescription and we&apos;ll source all your medicines and deliver them right to your door.
              </p>
              <Link
                to="/upload-prescription"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3 rounded-xl transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Prescription
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why PharmEasy ── */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Why Choose PharmEasy?</h2>
            <p className="text-gray-400 text-sm mt-2">Your health is our priority</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '✅', label: '100% Genuine', sub: 'All products verified & certified', color: 'bg-teal-50 text-teal-600' },
              { icon: '⚡', label: 'Fast Delivery', sub: 'Same day & express options', color: 'bg-yellow-50 text-yellow-600' },
              { icon: '🔒', label: 'Secure Payments', sub: 'COD, UPI & cards accepted', color: 'bg-blue-50 text-blue-600' },
              { icon: '🩺', label: '24/7 Support', sub: 'Expert pharmacist on call', color: 'bg-purple-50 text-purple-600' },
            ].map(({ icon, label, sub, color }) => (
              <div key={label} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-2xl mx-auto mb-4`}>
                  {icon}
                </div>
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
